import React, { useState, useEffect } from "react";
import images from "../utils/importImages";
import { useNavigate } from "react-router-dom";

const MainSitePage = () => {
  const [uploadedImage, setUploadedImage] = useState(images["map.jpg"]);
  const [adminName, setAdminName] = useState(""); // State to store the admin's name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        // Fetch token from localStorage
        const token = localStorage.getItem('token');
        console.log("Fetched Token from localStorage:", token);

        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Fetch admin name
        const response = await fetch('http://localhost:3001/api/admin-name', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin name');
        }

        const data = await response.json();
        setAdminName(data.name);
      } catch (error) {
        console.error("Failed to fetch admin name:", error);
        handleLogout();
      }
    };

    fetchAdminName();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Ensure you remove the correct key
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/password-change");
  };

  const handleNavigateToFlowers = () => {
    navigate("/flowers");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setUploadedImage(imageURL);
    }
  };

  const podFlowers = [
    { size: "Small", imageSrc: images["pod1.jpg"] },
    { size: "Middle", imageSrc: images["pod2.jpg"] },
    { size: "Big", imageSrc: images["pod3.jpg"] },
  ];

  const PodFlowerCard = ({ size, imageSrc }) => (
    <div
      className="pod-flower-card"
      onClick={() => navigate("/flowers/add", { state: { podSize: size } })}
      style={{ cursor: "pointer" }}
    >
      <div className="pod-flower-size">{size}</div>
      <img
        loading="lazy"
        src={imageSrc}
        alt={`${size} flower`}
        className="pod-flower-image"
      />
    </div>
  );

  return (
    <main className="main-container">
      <div className="content-wrapper">
        <div className="layout-container">
          <section className="sidebar">
            <div className="user-info">
              <div className="user-details">
                <div className="user-role">Account user:</div>
                <div className="user-type">{adminName || "Loading..."}</div>
              </div>
              <div className="user-actions">
                <button className="action-button" onClick={handleLogout}>
                  Log out
                </button>
                <button className="action-button" onClick={handleChangePassword}>
                  Change password
                </button>
              </div>
            </div>

            <div className="pod-flowers-section">
              <h2 className="section-title">Pod flowers</h2>
              {podFlowers.map((flower, index) => (
                <PodFlowerCard key={index} {...flower} />
              ))}
            </div>

            <div className="all-pod-flowers">
              <button className="change-pod-button" onClick={handleNavigateToFlowers}>
                View All Flowers
              </button>
            </div>
            
            <label className="map-upload-button">
              Upload Map
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
          </section>
          <section className="main-content">
            <div className="map-container">
              <img
                loading="lazy"
                src={uploadedImage}
                alt="Map"
                className="map-image"
              />
            </div>
          </section>
        </div>
      </div>
      <style jsx>{`
        .main-container {
          background-color: #f3f2ee;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .content-wrapper {
          background-color: #fff;
          padding-left: 13px;
        }
        .layout-container {
          display: flex;
          gap: 20px;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          width: 24%;
          margin-top: 20px;
          font-size: 14px;
          font-weight: 700;
        }
        .user-info {
          border-radius: 28px;
          background-color: #d9d9d9;
          padding: 21px 18px 8px;
        }
        .user-details {
          display: flex;
          gap: 14px;
          color: #000;
        }
        .user-actions {
          display: flex;
          margin-top: 32px;
          gap: 20px;
        }
        .action-button {
          border-radius: 28px;
          background-color: #8b89ff;
          color: #fff;
          padding: 9px 21px;
          border: none;
          cursor: pointer;
        }
        .pod-flowers-section,
        .all-pod-flowers {
          border-radius: 28px;
          background-color: #f1f1f1;
          margin-top: 22px;
          padding: 0 4px 25px;
          color: #000;
          text-align: center;
        }
        .section-title {
          background-color: #d9d9d9;
          border-radius: 28px;
          padding: 13px;
          margin: 0;
          
        }
        .pod-flower-card {
          border-radius: 28px;
          background-color: #d9d9d9;
          margin-top: 16px;
          width: 268px;
          padding: 13px 30px;
          display: flex;
          justify-content: space-between;
        }
        .pod-flower-image {
          width: 52px;
          aspect-ratio: 1.23;
          object-fit: contain;
        }
        .change-pod-button {
          border-radius: 30px;
          background-color: #8b89ff;
          margin-top: 4px;
          padding: 22px 111px;
          border: none;
          cursor: pointer;
          color: #fff;
  
    
        }
        
.map-upload-button {
  border-radius: 28px;
  background-color: #8b89ff;
  color: #fff;
  padding: 12px 60px;
  cursor: pointer;
  text-align: center;
  display: inline-block;
  margin-top: 40px; /* Increase margin to move it lower and away from the above button */
}
        .main-content {
          width: 76%;
          margin-left: 20px;
        }
        .map-container {
          border-radius: 28px;
          background-color: #d9d9d9;
          padding: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 90%;
          height: 90%;
          max-width: 100%;
        }
        .map-image {
          width: 100%;
          height: 100%;
        }
        @media (max-width: 991px) {
          .content-wrapper {
            margin-right: 3px;
          }
          .layout-container {
            flex-direction: column;
            gap: 0;
          }
          .sidebar,
          .main-content {
            width: 100%;
          }
          .map-image {
            max-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

export default MainSitePage;