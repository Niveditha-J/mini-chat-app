import React from "react";

const Message = ({ text, sender }) => {
  return (
    <div>
      <strong>{sender}:</strong> {text}
    </div>
  );
};

export default Message;
