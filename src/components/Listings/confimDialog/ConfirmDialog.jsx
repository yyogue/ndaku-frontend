import React from "react";
import "./ConfirmDialog.scss";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="dialog-buttons">
          <button className="confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="cancel" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
