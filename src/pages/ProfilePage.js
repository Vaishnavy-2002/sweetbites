import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, updateProfileWithFile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profile_picture || null);

  // Update formData when user data changes
  useEffect(() => {
    console.log('👤 User data changed:', user);
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || ''
    });
    setProfilePicturePreview(user?.profile_picture || null);
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfilePicture(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('🔄 Submitting profile update with data:', formData);
    console.log('📸 Profile picture:', profilePicture);

    try {
      let result;

      if (profilePicture) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.first_name);
        formDataToSend.append('last_name', formData.last_name);
        formDataToSend.append('phone_number', formData.phone_number);
        formDataToSend.append('profile_picture', profilePicture);

        result = await updateProfileWithFile(formDataToSend);
      } else {
        // Use regular JSON for text-only updates
        result = await updateProfile(formData);
      }

      console.log('📋 Update result:', result);

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setProfilePicture(null); // Clear the file after successful upload
        console.log('✅ Profile update successful!');
      } else {
        setError(result.error);
        console.log('❌ Profile update failed:', result.error);
      }
    } catch (error) {
      console.error('💥 Profile update error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || ''
    });
    setProfilePicture(null);
    setProfilePicturePreview(user?.profile_picture || null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-sweetbite-600 text-white px-4 py-2 rounded-lg hover:bg-sweetbite-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sweetbite-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sweetbite-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sweetbite-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sweetbite-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>

            {/* Profile Picture Section */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                {/* Profile Picture Preview */}
                <div className="relative">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-sweetbite-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {user?.first_name ? user.first_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sweetbite-50 file:text-sweetbite-700 hover:file:bg-sweetbite-100"
                      />
                      {profilePicturePreview && (
                        <button
                          type="button"
                          onClick={removeProfilePicture}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove picture
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {profilePicturePreview ? 'Profile picture uploaded' : 'No profile picture'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-sweetbite-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-sweetbite-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Member since:</span> {new Date(user.date_joined || Date.now()).toLocaleDateString()}</p>
              <p><span className="font-medium">Account type:</span> {user.is_staff ? 'Staff Member' : 'Customer'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
