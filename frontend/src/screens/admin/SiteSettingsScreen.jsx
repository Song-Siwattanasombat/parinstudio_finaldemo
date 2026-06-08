import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useUploadSiteImageMutation,
} from '../../slices/siteSettingsApiSlice';

const initialForm = {
  brandName: '',
  logoImage: '',
  heroTitle: '',
  heroText: '',
  heroImage: '',
  aboutTitle: '',
  aboutText: '',
  featureTitle: '',
  featureText: '',
  featureImage: '',
  reviewTitle: '',
  reviewText: '',
  reviewImage: '',
  contactEmail: '',
  stripeSecretKey: '',
  stripeEnabled: true,
  adminPassword: '',
};

const wordLimits = {
  brandName: 4,
  heroTitle: 12,
  heroText: 35,
  aboutTitle: 8,
  aboutText: 18,
  featureTitle: 8,
  featureText: 30,
  reviewTitle: 8,
  reviewText: 30,
};

const imageRules = {
  logoImage: {
    label: 'Logo Image',
    width: 500,
    height: 500,
    maxSize: 1,
  },
  heroImage: {
    label: 'Hero Image',
    width: 1920,
    height: 1080,
    maxSize: 3,
  },
  featureImage: {
    label: 'Feature Image',
    width: 1200,
    height: 900,
    maxSize: 2,
  },
  reviewImage: {
    label: 'Review Image',
    width: 1200,
    height: 900,
    maxSize: 2,
  },
};

const countWords = (value = '') =>
  value.trim().split(/\s+/).filter(Boolean).length;

const getImageSize = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.width, height: image.height });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image size'));
    };

    image.src = objectUrl;
  });

const SiteSettingsScreen = () => {
  const { data: settings, isLoading, error } = useGetSiteSettingsQuery();

  const [updateSiteSettings, { isLoading: loadingUpdate }] =
    useUpdateSiteSettingsMutation();
  const [uploadSiteImage, { isLoading: loadingUpload }] =
    useUploadSiteImageMutation();

  const [form, setForm] = useState(initialForm);
  const [pendingImages, setPendingImages] = useState({});
  const [previewImages, setPreviewImages] = useState({});

  useEffect(() => {
    if (settings) {
      setForm({
        brandName: settings.brandName || '',
        logoImage: settings.logoImage || '',
        heroTitle: settings.heroTitle || '',
        heroText: settings.heroText || '',
        heroImage: settings.heroImage || '',
        aboutTitle: settings.aboutTitle || '',
        aboutText: settings.aboutText || '',
        featureTitle: settings.featureTitle || '',
        featureText: settings.featureText || '',
        featureImage: settings.featureImage || '',
        reviewTitle: settings.reviewTitle || '',
        reviewText: settings.reviewText || '',
        reviewImage: settings.reviewImage || '',
        contactEmail: settings.contactEmail || '',
        stripeSecretKey: '',
        stripeEnabled: settings.stripeEnabled !== false,
        adminPassword: '',
      });
    }
  }, [settings]);

  const stripeSecretKeyChanged = Boolean(form.stripeSecretKey);
  const paymentAccountChanged = stripeSecretKeyChanged;

  const validateWordLimit = (field, value) => {
    const limit = wordLimits[field];

    if (limit && countWords(value) > limit) {
      toast.error(`${field} must be ${limit} words or fewer`);
      return false;
    }

    return true;
  };

  const changeHandler = (e) => {
    if (!validateWordLimit(e.target.name, e.target.value)) {
      return;
    }

    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));
  };

  const wordCountText = (field) =>
    wordLimits[field] ? `${countWords(form[field])}/${wordLimits[field]} words` : '';

  const imageRuleText = (field) => {
    const rule = imageRules[field];

    return `Required size: ${rule.width} x ${rule.height}px. Max file size: ${rule.maxSize}MB.`;
  };

  const uploadFileHandler = async (e, field) => {
    const file = e.target.files[0];
    const rule = imageRules[field];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    if (file.size > rule.maxSize * 1024 * 1024) {
      toast.error(`${rule.label} must be ${rule.maxSize}MB or smaller`);
      return;
    }

    try {
      const size = await getImageSize(file);

      if (size.width !== rule.width || size.height !== rule.height) {
        toast.error(`${rule.label} must be exactly ${rule.width} x ${rule.height}px`);
        return;
      }
    } catch (err) {
      toast.error(err.message);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadSiteImage(formData).unwrap();
      setPendingImages((prevImages) => ({
        ...prevImages,
        [field]: res.image,
      }));
      setPreviewImages((prevImages) => ({
        ...prevImages,
        [field]: false,
      }));
      toast.success(`${res.message}. Preview the image before using it.`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const previewImageHandler = (field) => {
    setPreviewImages((prevImages) => ({
      ...prevImages,
      [field]: !prevImages[field],
    }));
  };

  const selectImageHandler = (field) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: pendingImages[field],
    }));
    toast.success(`${imageRules[field].label} selected. Click Update to save.`);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const fieldOverLimit = Object.keys(wordLimits).find(
      (field) => countWords(form[field]) > wordLimits[field]
    );

    if (fieldOverLimit) {
      toast.error(`${fieldOverLimit} must be ${wordLimits[fieldOverLimit]} words or fewer`);
      return;
    }

    if (paymentAccountChanged && !form.adminPassword) {
      toast.error('Please confirm your admin password to change payment account settings');
      return;
    }

    try {
      await updateSiteSettings(form).unwrap();
      setForm((prevForm) => ({
        ...prevForm,
        stripeSecretKey: '',
        adminPassword: '',
      }));
      setPendingImages({});
      setPreviewImages({});
      toast.success('Site settings updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const renderTextField = ({ field, label, rows = 1, type = 'text' }) => (
    <Form.Group controlId={field} className='my-2'>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        as={rows > 1 ? 'textarea' : undefined}
        rows={rows > 1 ? rows : undefined}
        type={rows > 1 ? undefined : type}
        name={field}
        value={form[field]}
        onChange={changeHandler}
      />
      {wordLimits[field] && <Form.Text>{wordCountText(field)}</Form.Text>}
    </Form.Group>
  );

  const renderSettingsSection = (title, children) => (
    <fieldset className='border rounded p-3 my-4'>
      <legend className='float-none w-auto px-2 fs-5'>{title}</legend>
      {children}
    </fieldset>
  );

  const paymentStatusText = (isConnected) =>
    isConnected ? 'Connected' : 'Not connected';

  const renderStripeSection = () =>
    renderSettingsSection(
      'Stripe Payment Account',
      <>
        <Form.Check
          type='switch'
          id='stripeEnabled'
          name='stripeEnabled'
          label='Enable Stripe as the primary payment method'
          checked={form.stripeEnabled}
          onChange={(e) => setForm((prevForm) => ({
            ...prevForm,
            stripeEnabled: e.target.checked,
          }))}
          className='my-2'
        />

        <Form.Group controlId='stripeStatus' className='my-2'>
          <Form.Label>Stripe Status</Form.Label>
          <Form.Control
            type='text'
            value={paymentStatusText(settings?.hasStripeSecretKey)}
            readOnly
          />
          <Form.Text>
            Stripe accepts card payments and Google Pay. Payouts go to the bank account linked in Stripe.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='currentStripeSecretKey' className='my-2'>
          <Form.Label>Stripe Secret Key Status</Form.Label>
          <Form.Control
            type='text'
            value={settings?.hasStripeSecretKey ? 'Secret key saved' : 'Secret key missing'}
            readOnly
          />
          <Form.Text>
            The secret key is hidden after saving and is used to confirm successful Stripe payments.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='stripeSecretKey' className='my-2'>
          <Form.Label>New Stripe Secret Key</Form.Label>
          <Form.Control
            type='password'
            name='stripeSecretKey'
            value={form.stripeSecretKey}
            onChange={changeHandler}
            autoComplete='new-password'
          />
          <Form.Text>
            Leave this blank to keep the existing Stripe secret key.
          </Form.Text>
        </Form.Group>

        {stripeSecretKeyChanged && (
          <Message variant='warning'>
            Stripe account settings will change after you save.
          </Message>
        )}
      </>
    );

  const renderImageField = (field) => {
    const rule = imageRules[field];

    return (
      <Form.Group controlId={field} className='my-2'>
        <Form.Label>{rule.label}</Form.Label>
        <Form.Text className='d-block mb-1'>
          {imageRuleText(field)}
        </Form.Text>
        <Form.Control
          type='text'
          name={field}
          value={form[field]}
          onChange={changeHandler}
        />
        <Form.Control
          type='file'
          accept='image/*'
          onChange={(e) => uploadFileHandler(e, field)}
        />
        {pendingImages[field] && (
          <div className='my-2'>
            <Button
              type='button'
              variant='secondary'
              className='btn-sm'
              onClick={() => previewImageHandler(field)}
            >
              Preview
            </Button>
            <Button
              type='button'
              variant='primary'
              className='btn-sm'
              onClick={() => selectImageHandler(field)}
            >
              Use Image
            </Button>
          </div>
        )}
        {previewImages[field] && pendingImages[field] && (
          <img
            src={pendingImages[field]}
            alt={rule.label}
            style={{ width: '100%', maxWidth: '240px', marginTop: '10px' }}
          />
        )}
        {form[field] && (
          <Form.Text className='d-block'>
            Current: {form[field]}
          </Form.Text>
        )}
      </Form.Group>
    );
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Site Settings</h1>
        {loadingUpdate && <Loader />}
        {loadingUpload && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            {renderSettingsSection('Brand', (
              <>
                {renderTextField({ field: 'brandName', label: 'Brand Name' })}
                {renderImageField('logoImage')}
                {renderTextField({ field: 'contactEmail', label: 'Contact Email', type: 'email' })}
              </>
            ))}

            {renderSettingsSection('Homepage Hero', (
              <>
                {renderTextField({ field: 'heroTitle', label: 'Hero Title', rows: 2 })}
                {renderTextField({ field: 'heroText', label: 'Hero Text', rows: 3 })}
                {renderImageField('heroImage')}
              </>
            ))}

            {renderSettingsSection('About Section', (
              <>
                {renderTextField({ field: 'aboutTitle', label: 'About Title' })}
                {renderTextField({ field: 'aboutText', label: 'About Text', rows: 3 })}
              </>
            ))}

            {renderSettingsSection('Feature Section', (
              <>
                {renderTextField({ field: 'featureTitle', label: 'Feature Title' })}
                {renderTextField({ field: 'featureText', label: 'Feature Text', rows: 3 })}
                {renderImageField('featureImage')}
              </>
            ))}

            {renderSettingsSection('Review Section', (
              <>
                {renderTextField({ field: 'reviewTitle', label: 'Review Title' })}
                {renderTextField({ field: 'reviewText', label: 'Review Text', rows: 3 })}
                {renderImageField('reviewImage')}
              </>
            ))}

            {renderStripeSection()}

            {paymentAccountChanged && renderTextField({
              field: 'adminPassword',
              label: 'Confirm Admin Password',
              type: 'password',
            })}

            <Button type='submit' variant='primary' className='my-2'>
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default SiteSettingsScreen;
