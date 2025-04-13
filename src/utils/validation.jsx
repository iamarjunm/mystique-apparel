/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  /**
   * Validates a phone number (basic international format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  export const validatePhoneNumber = (phone) => {
    // Allows optional + prefix, numbers, spaces, hyphens, and parentheses
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };
  
  /**
   * Validates a ZIP code (basic international validation)
   * @param {string} zip - ZIP code to validate
   * @param {string} [country='IN'] - Country code for specific validation
   * @returns {boolean} True if valid
   */
  export const validateZipCode = (zip, country = 'IN') => {
    if (!zip) return false;
    
    const patterns = {
      IN: /^[1-9][0-9]{5}$/, // Indian PIN code
      US: /^[0-9]{5}(?:-[0-9]{4})?$/, // US ZIP
      CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canadian
      UK: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i, // UK
      DEFAULT: /^[a-zA-Z0-9\- ]{3,10}$/ // Fallback
    };
  
    const pattern = patterns[country] || patterns.DEFAULT;
    return pattern.test(zip);
  };
  
  /**
   * Validates required text field
   * @param {string} text - Text to validate
   * @param {number} [minLength=1] - Minimum required length
   * @returns {boolean} True if valid
   */
  export const validateRequiredText = (text, minLength = 1) => {
    return text?.trim().length >= minLength;
  };
  
  /**
   * Validates a shipping address object
   * @param {object} address - Address object to validate
   * @returns {object} { isValid: boolean, errors: object }
   */
  export const validateShippingAddress = (address) => {
    const errors = {};
    
    if (!validateRequiredText(address.firstName)) {
      errors.firstName = 'First name is required';
    }
    
    if (!validateRequiredText(address.lastName)) {
      errors.lastName = 'Last name is required';
    }
    
    if (!validateRequiredText(address.address1, 5)) {
      errors.address1 = 'Address line 1 must be at least 5 characters';
    }
    
    if (!validateRequiredText(address.city)) {
      errors.city = 'City is required';
    }
    
    if (!validateZipCode(address.zip, address.country)) {
      errors.zip = 'Invalid ZIP/postal code';
    }
    
    if (!validatePhoneNumber(address.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validates the checkout form
   * @param {object} formData - Form data to validate
   * @param {object} shippingAddress - Shipping address to validate
   * @param {array} cart - Cart items to validate
   * @param {object} selectedShippingRate - Selected shipping rate
   * @returns {object} { isValid: boolean, errors: object }
   */
  export const validateCheckoutForm = (
    formData,
    shippingAddress,
    cart,
    selectedShippingRate
  ) => {
    const errors = {};
    
    // Personal info validation
    if (!validateRequiredText(formData.fullName)) {
      errors.fullName = 'Full name is required';
    }
    
    if (!validateEmail(formData.email)) {
      errors.email = 'Valid email is required';
    }
    
    // Shipping address validation
    const addressValidation = validateShippingAddress(shippingAddress);
    if (!addressValidation.isValid) {
      Object.assign(errors, addressValidation.errors);
    }
    
    // Cart validation
    if (!cart?.length) {
      errors.cart = 'Your cart is empty';
    }
    
    // Shipping method validation
    if (!selectedShippingRate) {
      errors.shippingMethod = 'Please select a shipping method';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validates a Razorpay payment response
   * @param {object} response - Razorpay response
   * @param {string} keySecret - Razorpay key secret
   * @returns {boolean} True if signature is valid
   */
  export const validateRazorpayPayment = (response, keySecret) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
    
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === razorpay_signature;
  };