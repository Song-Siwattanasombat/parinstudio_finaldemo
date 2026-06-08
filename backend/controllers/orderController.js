import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import SiteSettings from "../models/siteSettingsModel.js";
import sendEmail from "../utils/sendEmail.js";

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
const addDecimals = (num) => Number((Math.round(Number(num || 0) * 100) / 100).toFixed(2));

const badOrderRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const orderItemsText = (order) =>
  order.orderItems
    .map((item) => `${item.name} x ${item.qty} - ${formatMoney(item.price * item.qty)}`)
    .join('\n');

const orderItemsHtml = (order) =>
  order.orderItems
    .map((item) => `<li>${item.name} x ${item.qty} - ${formatMoney(item.price * item.qty)}</li>`)
    .join('');

const shippingAddressText = (order) =>
  `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;

const toCents = (value) => Math.round(Number(value || 0) * 100);

const cleanConfigValue = (value) => String(value || '').trim();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const isOrderOwner = (order, user) => {
  const orderUserId = order.user?._id || order.user;

  return orderUserId.toString() === user._id.toString();
};

const calculatePrices = (itemsPrice) => {
  const roundedItemsPrice = addDecimals(itemsPrice);
  const shippingPrice = roundedItemsPrice > 50 ? 0 : 10;
  const taxPrice = addDecimals(roundedItemsPrice * 0.1);
  const totalPrice = addDecimals(roundedItemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: roundedItemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

const normalizeOrderRequestItems = (orderItems = []) =>
  orderItems.map((item) => ({
    productId: String(item.product || item._id || ''),
    qty: Number(item.qty),
  }));

const buildOrderItemsFromProducts = async (requestedItems) => {
  const normalizedItems = normalizeOrderRequestItems(requestedItems);

  if (!normalizedItems.length) {
    throw badOrderRequest('No order items');
  }

  if (
    normalizedItems.some((item) =>
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.qty) ||
      item.qty < 1
    )
  ) {
    throw badOrderRequest('Invalid order item quantity');
  }

  const requestedByProductId = normalizedItems.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.qty;
    return acc;
  }, {});
  const productIds = Object.keys(requestedByProductId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw badOrderRequest('One or more products are no longer available');
  }

  return products.map((product) => {
    const qty = requestedByProductId[product._id.toString()];

    if (product.countInStock < qty) {
      throw badOrderRequest(`${product.name} has only ${product.countInStock} in stock`);
    }

    return {
      name: product.name,
      qty,
      image: product.image,
      price: product.price,
      product: product._id,
    };
  });
};

const assertOrderStockAvailable = async (order, session) => {
  const orderItems = order.orderItems || [];
  const productIds = orderItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).session(session);
  const productsById = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});

  for (const item of orderItems) {
    const product = productsById[item.product.toString()];

    if (!product) {
      throw badOrderRequest(`${item.name} is no longer available`);
    }

    if (product.countInStock < item.qty) {
      throw badOrderRequest(`${product.name} has only ${product.countInStock} in stock`);
    }
  }
};

const deductOrderStock = async (order, session) => {
  if (order.stockDeducted) {
    return;
  }

  await assertOrderStockAvailable(order, session);

  const stockUpdateResult = await Product.bulkWrite(
    order.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product, countInStock: { $gte: item.qty } },
        update: { $inc: { countInStock: -item.qty } },
      },
    })),
    { session }
  );

  if (stockUpdateResult.modifiedCount !== order.orderItems.length) {
    throw badOrderRequest('Not enough stock to complete this order');
  }

  order.stockDeducted = true;
};

const getPayPalCredentials = async () => {
  const settings = await SiteSettings.findOne({});

  if (settings?.paypalEnabled !== true) {
    throw new Error('PayPal payments are disabled');
  }

  return {
    clientId: cleanConfigValue(settings?.paypalClientId || process.env.PAYPAL_CLIENT_ID),
    clientSecret: cleanConfigValue(settings?.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET),
    apiUrl: cleanConfigValue(process.env.PAYPAL_API_URL) || 'https://api-m.sandbox.paypal.com',
  };
};

const getStripeCredentials = async () => {
  const settings = await SiteSettings.findOne({});

  return {
    secretKey: cleanConfigValue(settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY),
    apiUrl: cleanConfigValue(process.env.STRIPE_API_URL) || 'https://api.stripe.com',
    enabled: settings?.stripeEnabled !== false,
  };
};

const stripeRequest = async ({ path, method = 'GET', body }) => {
  const { secretKey, apiUrl, enabled } = await getStripeCredentials();

  if (!enabled) {
    throw new Error('Stripe payments are disabled');
  }

  if (!secretKey) {
    throw new Error('Stripe payment is not configured');
  }

  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Unable to process Stripe payment');
  }

  return data;
};

const buildStripeCheckoutParams = ({ order }) => {
  const params = new URLSearchParams();

  params.append('mode', 'payment');
  params.append('success_url', `${clientUrl}/order/${order._id}?stripe_session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${clientUrl}/order/${order._id}`);
  params.append('payment_method_types[0]', 'card');
  params.append('customer_email', order.user.email);
  params.append('client_reference_id', order._id.toString());
  params.append('metadata[orderId]', order._id.toString());
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'aud');
  params.append('line_items[0][price_data][unit_amount]', String(toCents(order.totalPrice)));
  params.append('line_items[0][price_data][product_data][name]', `Parin Studio Order ${order._id}`);

  return params;
};

const verifyStripeSession = async ({ sessionId, order }) => {
  if (!sessionId) {
    throw new Error('Missing Stripe checkout session id');
  }

  const session = await stripeRequest({
    path: `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
  });

  if (session.metadata?.orderId !== order._id.toString()) {
    throw new Error('Stripe checkout session does not match this order');
  }

  if (session.payment_status !== 'paid') {
    throw new Error('Stripe payment is not paid');
  }

  if (session.currency !== 'aud') {
    throw new Error('Stripe payment currency does not match this store');
  }

  if (Number(session.amount_total) !== toCents(order.totalPrice)) {
    throw new Error('Stripe payment amount does not match this order');
  }

  return session;
};

const getPayPalAccessToken = async () => {
  const { clientId, clientSecret, apiUrl } = await getPayPalCredentials();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal server verification is not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error('Unable to verify payment with PayPal');
  }

  return { accessToken: data.access_token, apiUrl };
};

const getVerifiedPayPalOrder = async ({ paypalOrderId, order }) => {
  if (!paypalOrderId) {
    throw new Error('Missing PayPal order id');
  }

  const { accessToken, apiUrl } = await getPayPalAccessToken();
  const response = await fetch(`${apiUrl}/v2/checkout/orders/${paypalOrderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const paypalOrder = await response.json();

  if (!response.ok) {
    throw new Error('Unable to verify PayPal order');
  }

  const purchaseUnit = paypalOrder.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];
  const paypalAmount = capture?.amount || purchaseUnit?.amount;

  if (paypalOrder.status !== 'COMPLETED' || capture?.status !== 'COMPLETED') {
    throw new Error('PayPal payment is not completed');
  }

  if (paypalAmount?.currency_code !== 'AUD') {
    throw new Error('PayPal payment currency does not match this store');
  }

  if (toCents(paypalAmount?.value) !== toCents(order.totalPrice)) {
    throw new Error('PayPal payment amount does not match this order');
  }

  return { paypalOrder, capture };
};

const getAdminEmails = async () => {
  const [settings, admins] = await Promise.all([
    SiteSettings.findOne({}),
    User.find({ isAdmin: true }).select('email'),
  ]);

  return [
    settings?.contactEmail,
    ...admins.map((adminUser) => adminUser.email),
  ].filter(Boolean);
};

const sendOrderEmails = async ({ order, type }) => {
  try {
    const populatedOrder = await order.populate('user', 'username email');
    const adminEmails = await getAdminEmails();

    if (type === 'paid') {
      const customerSubject = `Parin Studio order confirmation ${populatedOrder._id}`;
      const adminSubject = `New paid order ${populatedOrder._id}`;
      const customerText = [
        `Thank you for your order, ${populatedOrder.user.username}.`,
        `Order ID: ${populatedOrder._id}`,
        `Total: ${formatMoney(populatedOrder.totalPrice)}`,
        `Shipping to: ${shippingAddressText(populatedOrder)}`,
        '',
        'Items:',
        orderItemsText(populatedOrder),
      ].join('\n');
      const customerHtml = `
        <p>Thank you for your order, ${populatedOrder.user.username}.</p>
        <p><strong>Order ID:</strong> ${populatedOrder._id}</p>
        <p><strong>Total:</strong> ${formatMoney(populatedOrder.totalPrice)}</p>
        <p><strong>Shipping to:</strong> ${shippingAddressText(populatedOrder)}</p>
        <ul>${orderItemsHtml(populatedOrder)}</ul>
      `;

      await sendEmail({
        to: populatedOrder.user.email,
        subject: customerSubject,
        text: customerText,
        html: customerHtml,
      });

      if (adminEmails.length) {
        await sendEmail({
          to: adminEmails.join(','),
          subject: adminSubject,
          text: [
            `A customer completed payment.`,
            `Order ID: ${populatedOrder._id}`,
            `Customer: ${populatedOrder.user.username} (${populatedOrder.user.email})`,
            `Total: ${formatMoney(populatedOrder.totalPrice)}`,
            `Shipping to: ${shippingAddressText(populatedOrder)}`,
            '',
            'Items:',
            orderItemsText(populatedOrder),
          ].join('\n'),
          html: `
            <p>A customer completed payment.</p>
            <p><strong>Order ID:</strong> ${populatedOrder._id}</p>
            <p><strong>Customer:</strong> ${populatedOrder.user.username} (${populatedOrder.user.email})</p>
            <p><strong>Total:</strong> ${formatMoney(populatedOrder.totalPrice)}</p>
            <p><strong>Shipping to:</strong> ${shippingAddressText(populatedOrder)}</p>
            <ul>${orderItemsHtml(populatedOrder)}</ul>
          `,
        });
      }
    }

    if (type === 'delivered') {
      await sendEmail({
        to: populatedOrder.user.email,
        subject: `Your Parin Studio order has shipped ${populatedOrder._id}`,
        text: [
          `Your order has been marked as delivered/shipped.`,
          `Order ID: ${populatedOrder._id}`,
          `Delivered at: ${populatedOrder.deliveredAt}`,
          `Shipping address: ${shippingAddressText(populatedOrder)}`,
        ].join('\n'),
        html: `
          <p>Your order has been marked as delivered/shipped.</p>
          <p><strong>Order ID:</strong> ${populatedOrder._id}</p>
          <p><strong>Delivered at:</strong> ${populatedOrder.deliveredAt}</p>
          <p><strong>Shipping address:</strong> ${shippingAddressText(populatedOrder)}</p>
        `,
      });
    }
  } catch (err) {
    console.error(`Order ${type} email failed:`, err.message);
  }
};


// @desc    Create new order
// @route   POST /api/orders
// @access  Private

const addOrderItems = asyncHandler ( async (req, res) => {
   const {
      orderItems,
      shippingAddress, 
      paymentMethod
    } = req.body;

    if ( orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error ('No order items');
    } else {
      const verifiedOrderItems = await buildOrderItemsFromProducts(orderItems);
      const prices = calculatePrices(
        verifiedOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      );
      const order = new Order ({
        orderItems: verifiedOrderItems,
      user: req.user._id,
      shippingAddress, 
      paymentMethod,
      itemsPrice: prices.itemsPrice,
      taxPrice: prices.taxPrice,
      shippingPrice: prices.shippingPrice,
      totalPrice: prices.totalPrice
      });

      const createOrder = await order.save();
      res.status(201).json(createOrder);

    }
  }); 

// @desc    Get logged in new order
// @route   GET /api/orders/myorders
// @access  Private

const getMyOrders = asyncHandler ( async (req, res) => {
   const orders = await Order.find({ user: req.user._id });
   res.status(200).json(orders);
  }); 

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private

const getOrderById = asyncHandler ( async (req, res) => {
   const order = await Order.findById(req.params.id).populate('user',
    'username email');

    if (order) {
      if (!req.user.isAdmin && !isOrderOwner(order, req.user)) {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }

      res.status (200).json(order);
    } else {
      res.status(404);
      throw new Error ('Order not found');
    }
   }); 

// @desc    Update order to Paid
// @route   PUT /api/orders/:id/pay
// @access  Private

const updateOrderToPaid = asyncHandler ( async (req, res) => {
   const order= await Order.findById(req.params.id);

   if (order) {
    if (!isOrderOwner(order, req.user)) {
      res.status(403);
      throw new Error('Not authorized to pay this order');
    }

    const { paypalOrder, capture } = await getVerifiedPayPalOrder({
      paypalOrderId: req.body.id,
      order,
    });
    const wasPaid = order.isPaid;
    let updateOrder;
    await mongoose.connection.transaction(async (session) => {
      if (!wasPaid) {
        await deductOrderStock(order, session);
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paypalOrder.id,
        status: paypalOrder.status,
        update_time: capture.update_time,
        email_address: paypalOrder.payer?.email_address,
      };
      updateOrder = await order.save({ session });
    });

    if (!wasPaid) {
      await sendOrderEmails({ order: updateOrder, type: 'paid' });
    }

    res.status(200).json(updateOrder);
   } else {
    res.status(404);
    throw new Error('Order not found');
   }
  }); 

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin

const updateOrderToDelivered = asyncHandler ( async (req, res) => {
   const order = await Order.findById(req.params.id);

   if (order) {
    const wasDelivered = order.isDelivered;
    order.isDelivered = true;
    order.deliveredAt = Date.now ();

    const updatedOrder = await order.save();
    if (!wasDelivered) {
      await sendOrderEmails({ order: updatedOrder, type: 'delivered' });
    }

    res.status(200).json(updatedOrder);
   } else {
      res.status(404);
      throw new Error('Order not found');
   }
  }); 

// @desc    Get all orders
// @route   GET /api/orders/
// @access  Private/Admin

const getOrders = asyncHandler ( async (req, res) => {
   const orders = await Order.find({}).populate('user','username email',);
   res.status(200).json(orders)
  }); 

// @desc    Create Stripe checkout session
// @route   POST /api/orders/:id/stripe-checkout-session
// @access  Private

const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'username email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!isOrderOwner(order, req.user)) {
    res.status(403);
    throw new Error('Not authorized to pay this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const session = await stripeRequest({
    path: '/v1/checkout/sessions',
    method: 'POST',
    body: buildStripeCheckoutParams({ order }),
  });

  res.status(200).json({ id: session.id, url: session.url });
});

// @desc    Verify Stripe checkout session and mark order paid
// @route   PUT /api/orders/:id/stripe-session
// @access  Private

const updateOrderToPaidByStripe = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!isOrderOwner(order, req.user)) {
    res.status(403);
    throw new Error('Not authorized to pay this order');
  }

  const session = await verifyStripeSession({
    sessionId: req.body.sessionId,
    order,
  });

  const wasPaid = order.isPaid;
  let updatedOrder;
  await mongoose.connection.transaction(async (mongoSession) => {
    if (!wasPaid) {
      await deductOrderStock(order, mongoSession);
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: session.payment_intent || session.id,
      status: session.payment_status,
      update_time: new Date().toISOString(),
      email_address: session.customer_details?.email,
    };

    updatedOrder = await order.save({ session: mongoSession });
  });

  if (!wasPaid) {
    await sendOrderEmails({ order: updatedOrder, type: 'paid' });
  }

  res.status(200).json(updatedOrder);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin

const deleteOrder = asyncHandler ( async (req, res) => {
   const order = await Order.findById(req.params.id);

   if (order) {
    await Order.deleteOne({_id: order._id});
    res.status(200).json({message: 'Order deleted successfully'});
   } else {
    res.status(404);
    throw new Error('Order not found');
   }
  });

  
  export {
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    createStripeCheckoutSession,
    updateOrderToPaidByStripe,
    updateOrderToDelivered,
    getOrders,
    deleteOrder
  };
