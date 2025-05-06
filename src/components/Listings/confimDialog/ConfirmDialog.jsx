import React from "react";
import "./ConfirmDialog.scss";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="dialog-buttons">
          <button className="confirm" onClick={onConfirm}>
            Oui
          </button>
          <button className="cancel" onClick={onCancel}>
            Non
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
