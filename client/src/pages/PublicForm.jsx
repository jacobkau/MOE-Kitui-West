import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function PublicForm() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch Form Details and School List
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the form by public slug
        const formRes = await api.get(`/collections/public/${slug}`);
        setCollection(formRes.data);

        // Fetch schools (we need a public endpoint for this)
        const schoolsRes = await api.get('/schools/public-list');
        setSchools(schoolsRes.data);
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load form.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Handle text/number changes
  const handleInputChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchool) {
      setMessage({ type: 'error', text: 'Please select your school from the list.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post(`/submissions/public/${slug}`, {
        schoolId: selectedSchool,
        answers: answers,
      });
      setMessage({ type: 'success', text: 'Data submitted successfully! You can close this page.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading form...</div>;

  // If form is closed or not found
  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Form Unavailable</h1>
          <p className="text-gray-600">{message.text || 'This form does not exist or has been closed by the admin.'}</p>
        </div>
      </div>
    );
  }

  // Group fields by their "group" property (e.g., General, Enrollment, etc.)
  const groupedFields = collection.fields.reduce((acc, field) => {
    const group = field.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <p className="text-blue-200 mt-1">Term: {collection.term}</p>
          {collection.description && <p className="mt-2 text-sm">{collection.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Messages */}
          {message.text && (
            <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          {/* STEP 1: Select School */}
          <div className="mb-8 bg-gray-50 p-4 rounded-md border">
            <label className="block text-gray-700 font-bold mb-2">Select Your School *</label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Choose your school --</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} ({s.zone} Zone)
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: Dynamic Form Fields */}
          {Object.entries(groupedFields).map(([groupName, fields]) => (
            <div key={groupName} className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{groupName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={answers[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        value={answers[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="3"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        required={field.required}
                        value={answers[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* STEP 3: Submit */}
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
              {submitting ? 'Submitting...' : 'Submit Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
