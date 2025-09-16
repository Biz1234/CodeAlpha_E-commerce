import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  // redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      console.error('Logout function is unavailable');
    }
    navigate('/');
  };

  if (!user) return null; // prevent flashing content

  return (
    <div className="profile-wrapper">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-card">
        <div className="profile-info">
          <p>
            <strong>Name:</strong> {user.name || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {user.email || 'N/A'}
          </p>
        </div>

        <div className="profile-actions">
          <button
            className="btn view-orders-btn"
            onClick={() => navigate('/orders')}
          >
            View Orders
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
