import React, { useState, useEffect } from 'react';
import { originApi } from '../../api/data/originApi';
import { pointApi } from '../../api/data/pointApi';
import { originTypeApi } from '../../api/data/originTypeApi';

const OriginsForm = ({ originToEdit, onSave, onCancel }) => {
  const initialFormData = {
    point_id: '',
    name: '',
    origin: '', // Note: This 'origin' text field (identifier) is displayed and editable in the form.
                // However, the current originApi.createOrigin does not accept it (expects backend generation),
                // and originApi.updateOrigin does not update it.
                // Changes to this field in the form will not be persisted to the backend with the current API.
    origin_type_id: '',
    credentials: '{}', // Default to empty JSON object string
    is_enabled: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [points, setPoints] = useState([]);
  const [originTypes, setOriginTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (originToEdit) {
      setFormData({
        point_id: originToEdit.point_id || '',
        name: originToEdit.name || '',
        origin: originToEdit.origin || '',
        origin_type_id: originToEdit.origin_type_id || '',
        credentials: typeof originToEdit.credentials === 'string' ? originToEdit.credentials : JSON.stringify(originToEdit.credentials || {}),
        is_enabled: originToEdit.is_enabled !== undefined ? originToEdit.is_enabled : true,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [originToEdit]);

  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      setLoadingDropdowns(true);
      setError(null);
      try {
        const [pointsData, originTypesData] = await Promise.all([
          pointApi.getPoints(), // Fetches all points
          originTypeApi.getOriginTypes() // Fetches origin types in {value, label} format
        ]);
        // Map pointsData to { value, label } format for the dropdown
        const formattedPoints = pointsData.map(point => ({
          value: point.id, // Assuming point.id is the correct value for point_id FK
          label: point.name,
        }));
        setPoints(formattedPoints);
        setOriginTypes(originTypesData);
      } catch (err) {
        setError('Failed to load data for dropdowns.');
        console.error(err);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDataForDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let parsedCredentials;
    if (formData.credentials && formData.credentials.trim() !== '') {
      try {
        parsedCredentials = JSON.parse(formData.credentials);
      } catch (jsonError) {
        setError('Credentials field contains invalid JSON.');
        console.error("JSON parsing error for credentials:", jsonError);
        setSaving(false);
        return;
      }
    } else {
      // If credentials are empty or whitespace, treat as null or undefined
      // originApi handles null/undefined by setting SQL NULL.
      parsedCredentials = null;
    }

    // Prepare data payload according to originApi expectations
    const commonData = {
      name: formData.name,
      point_id: parseInt(formData.point_id, 10),
      origin_type_id: parseInt(formData.origin_type_id, 10),
      credentials: parsedCredentials,
      is_enabled: formData.is_enabled,
      // formData.origin is intentionally omitted here as originApi.createOrigin
      // expects it to be backend-generated, and originApi.updateOrigin
      // does not currently support updating this specific 'origin' text field.
    };

    try {
      if (originToEdit && originToEdit.id) {
        // For updates, originApi.updateOrigin takes the ID and an object of fields to update.
        await originApi.updateOrigin(originToEdit.id, commonData);
      } else {
        // For creates, originApi.createOrigin takes the data object.
        await originApi.createOrigin(commonData);
      }
      onSave(); // Callback to refresh list or close form
    } catch (err) {
      setError('Failed to save origin.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loadingDropdowns) return <p>Loading form data...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>{originToEdit ? 'Edit Origin' : 'Add New Origin'}</h2>
      {originToEdit && <p>Editing Origin ID: {originToEdit.id}</p>}

      <div>
        <label htmlFor="point_id">Point:</label>
        <select id="point_id" name="point_id" value={formData.point_id} onChange={handleChange} required>
          <option value="">Select a Point</option>
          {points.map(point => <option key={point.value} value={point.value}>{point.label}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="origin">Origin (URL/Identifier):</label>
        <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleChange} 
               required 
               title="Note: While you can edit this, the current backend API might not save changes to this specific identifier field after creation." 
        />
        {/* A comment is added above regarding the 'origin' field behavior with the current API */}
      </div>

      <div>
        <label htmlFor="origin_type_id">Origin Type:</label>
        <select id="origin_type_id" name="origin_type_id" value={formData.origin_type_id} onChange={handleChange} required>
          <option value="">Select an Origin Type</option>
          {originTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="credentials">Credentials (JSON):</label>
        <textarea id="credentials" name="credentials" value={formData.credentials} onChange={handleChange} rows="4" />
      </div>

      <div>
        <label htmlFor="is_enabled">Is Enabled:</label>
        <input type="checkbox" id="is_enabled" name="is_enabled" checked={formData.is_enabled} onChange={handleChange} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Origin'}</button>
      <button type="button" onClick={onCancel} disabled={saving} style={{ marginLeft: '10px' }}>Cancel</button>
    </form>
  );
};

export default OriginsForm;