import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Listings from '../Listings/Listings';
import AddListing from '../AddListing/AddListing';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import './DashboardLayout.scss';

const DashboardLayout = () => {
  const [showModal, setShowModal] = useState(false);

  const handleAddListing = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="dashboard-layout">
      {/* <Sidebar /> */}
      <div className="main-content">
        <div className="header">
          <h2>My Listings</h2>
          <button className="add-listing-btn" onClick={handleAddListing}>
            + Add Listing
          </button>
        </div>

        <Listings />

        {showModal && (
          <ModalWrapper onClose={handleCloseModal}>
            <AddListing />
          </ModalWrapper>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
