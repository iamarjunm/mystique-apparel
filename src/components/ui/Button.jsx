// src/components/ui/Button.jsx

const Button = ({ children, onClick, disabled, className }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  