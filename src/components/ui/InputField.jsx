// src/components/ui/InputField.jsx

const InputField = ({ label, value, onChange, type = "text", placeholder = "" }) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
        />
      </div>
    );
  };
  
  export default InputField;
  