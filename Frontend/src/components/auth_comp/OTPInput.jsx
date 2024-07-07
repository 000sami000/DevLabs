import React, { useState, useRef } from 'react';

const OTPInput = ({ length = 6, onChange }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;

    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }

    // Ensure the latest state is passed
    onChange(newOtp.join(""));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (e.target.previousSibling) {
          e.target.previousSibling.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    const newOtp = pasteData.split("").map((char, idx) => (!isNaN(char) ? char : otp[idx]));
    setOtp(newOtp);
    inputs.current[0].focus();
    onChange(newOtp.join(""));
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
 
      {otp.map((data, index) => (
        <input
          className="w-10 h-10 text-center text-xl border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          type="text"
          name="otp"
          maxLength="1"
          key={index}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputs.current[index] = el)}
        />
      ))}
    </div>
  );
};


export default OTPInput;
