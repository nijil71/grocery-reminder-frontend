import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInputWithCountryCode = ( {phoneNumber ,  setPhoneNumber}) => {
  const handlePhoneChange = (phone) => {
    if (!phone.startsWith('+')) {
      phone = `+${phone}`;
    }
    setPhoneNumber(phone);
  };
  return (
    <div>
      
      <PhoneInput
        country={'in'} 
        value={phoneNumber}
        onChange={handlePhoneChange}
        inputStyle={{ width: '100%' }}
        enableSearch
        required
      />
    </div>
  );
};

export default PhoneInputWithCountryCode;
