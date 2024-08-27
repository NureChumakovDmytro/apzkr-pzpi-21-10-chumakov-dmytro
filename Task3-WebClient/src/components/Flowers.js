import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// PodInfo Component
const PodInfo = ({ id, name, species, location, lastWatered, needsWater, temperature, soilMoisture, onDelete }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/flowers/edit`, {
      state: { id, name, species, location, lastWatered, needsWater, temperature, soilMoisture },
    });
  };

  return (
    <div className="pod-info">
      <div className="info-item">Name: {name}</div>
      <div className="info-item">Species: {species}</div>
      <div className="info-item">Location: {location}</div>
      <div className="info-item">Last Watered: {lastWatered}</div>
      <div className="info-item">Needs Water: {needsWater ? "Yes" : "No"}</div>
      <div className="info-item">Temperature: {temperature}°C</div>
      <div className="info-item">Soil Moisture: {soilMoisture}</div>
      <button className="action-button" onClick={() => onDelete(id)}>Delete Pod</button>
      <button className="action-button" onClick={handleEditClick}>Change info</button>
    </div>
  );
};

// UserHeader Component
const UserHeader = ({ userType,onLogout, onChangePassword }) => (
  <header className="user-header">
    <div className="user-info">
      <span className="user-label">Account user:</span>
      <span className="user-type">{userType}</span>
    </div>
    <nav className="user-actions">
      <button className="action-btn" onClick={onLogout}>Log out</button>
      <button className="action-btn" onClick={onChangePassword}>Change password</button>
    </nav>
  </header>
);

const Flowers = () => {
  const [plantData, setPlantData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(""); // State to store the admin's name

  const itemsPerPage = 3;
  const totalPages = Math.ceil(plantData.length / itemsPerPage);

  useEffect(() => {
    const fetchPlantData = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/user-plants', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data: ' + response.statusText);
        }

        const data = await response.json();
        setPlantData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlantData();
  }, []);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) =>
      direction === "next" ? Math.min(prevPage + 1, totalPages) : Math.max(prevPage - 1, 1)
    );
  };

  const displayedPlants = plantData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/password-change");
  };

  const handleBackClick = () => {
    navigate("/main");
  };

  const handleDeletePod = async (podId) => {
    if (!podId) {
      console.error('No podId provided');
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this pod?")) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3001/api/user-plants/${podId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.ok) {
          setPlantData(plantData.filter(plant => plant.plant_id !== podId));
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to delete pod: ${errorText}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.message);
      }
    }
  };
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
  return (
    <div className="main-container">
      <UserHeader 
        userType={adminName} // or dynamically fetch this value from context, state, etc.
        onLogout={handleLogout} 
        onChangePassword={handleChangePassword} 
      />
      <section className="pod-container">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : displayedPlants.length > 0 ? (
          displayedPlants.map((plant, index) => (
            <article key={index} className="pod-card">
              <PodInfo 
                id={plant.plant_id}
                name={plant.name}
                species={plant.species}
                location={plant.location}
                lastWatered={plant.last_sensor_update}
                needsWater={plant.needs_watering}
                temperature={plant.temperature}
                soilMoisture={plant.soil_moisture}
                onDelete={handleDeletePod}
              />
            </article>
          ))
        ) : (
          <p>No data available</p>
        )}
      </section>
      <nav className="pagination">
        <button
          className="nav-btn"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
        >
          Back
        </button>
        <span className="page-info">
          Page: {currentPage} of {totalPages}
        </span>
        <button
          className="nav-btn"
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </nav>
      <footer className="footer-actions">
        <button className="footer-btn" onClick={handleBackClick}>Back</button>
        <button className="footer-btn" onClick={() => navigate("/flowers/add")}>Add new plant</button>
      </footer>
      <style jsx>{`
        .main-container {
          background-color: #f3f2ee;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .user-header {
          border-radius: 28px;
          background-color: #d9d9d9;
          display: flex;
          width: 336px;
          max-width: 100%;
          flex-direction: column;
          font-size: 14px;
          font-weight: 700;
          padding: 21px 17px 8px;
        }
        .user-info {
          display: flex;
          margin-left: 10px;
          gap: 14px;
          color: #000;
        }
        .user-label, .user-type {
          font-family: Montserrat, sans-serif;
        }
        .user-actions {
          display: flex;
          margin-top: 32px;
          gap: 20px;
          justify-content: space-between;
        }
        .action-btn {
          font-family: Montserrat, sans-serif;
          border-radius: 28px;
          background-color: #8b89ff;
          color: #fff;
          padding: 9px 21px;
          border: none;
          cursor: pointer;
        }
        .pod-container {
          display: flex;
          gap: 20px;
          margin-top: 135px;
        }
        .pod-card {
          border-radius: 28px;
          background-color: #f1f1f1;
          display: flex;
          flex-direction: column;
          font-size: 14px;
          color: #000;
          font-weight: 700;
          justify-content: center;
          width: 33%;
          padding: 18px 22px;
        }
        .pod-info {
          border-radius: 28px;
          background-color: rgba(217, 217, 217, 1);
          display: flex;
          flex-direction: column;
          padding: 8px 10px 8px 4px;
        }
        .info-item {
          font-family: Montserrat, sans-serif;
          border-radius: 28.5px;
          background-color: #edecec;
          width: 100%;
          padding: 8px 17px;
          margin-bottom: 4px;
        }
        .action-button {
          font-family: Montserrat, sans-serif;
          border-radius: 28.5px;
          background-color: #ebebeb;
          align-self: center;
          margin-top: 4px;
          width: 200px;
          max-width: 100%;
          padding: 11px 0;
          border: none;
          cursor: pointer;
        }
        .pagination {
          display: flex;
          margin-top: 77px;
          width: 645px;
          max-width: 100%;
          gap: 20px;
          font-size: 20px;
          color: #000;
          font-weight: 700;
          justify-content: space-between;
          align-self: center;
        }
        .nav-btn, .page-info {
          font-family: Montserrat, sans-serif;
          border-radius: 28px;
          background-color: #d9d9d9;
          padding: 22px 57px;
          border: none;
          cursor: pointer;
        }
        .nav-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .footer-actions {
          display: flex;
          margin-top: 95px;
          width: 869px;
          max-width: 100%;
          align-items: start;
          gap: 20px;
          font-size: 32px;
          color: #000;
          font-weight: 700;
          justify-content: space-between;
          align-self: center;
        }
        .footer-btn {
          font-family: Montserrat, sans-serif;
          border-radius: 28px;
          background-color: #d9d9d9;
          padding: 23px 56px;
          border: none;
          cursor: pointer;
        }
        @media (max-width: 991px) {
          .user-header {
            padding-right: 20px;
          }
          .action-btn {
            padding: 9px 20px;
          }
          .pod-container {
            flex-direction: column;
            align-items: stretch;
            gap: 40px;
            margin-top: 40px;
          }
          .pod-card {
            width: 100%;
            padding: 18px 20px;
          }
          .pagination {
            flex-wrap: wrap;
            margin-top: 40px;
          }
          .nav-btn, .page-info {
            padding: 22px 20px;
          }
          .footer-actions {
            flex-wrap: wrap;
            margin-top: 40px;
          }
          .footer-btn {
            padding: 23px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Flowers;

