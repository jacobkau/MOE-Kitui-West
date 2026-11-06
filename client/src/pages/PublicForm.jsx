import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [isSuccess, setIsSuccess] = useState(false); // New success state

  // 1. Fetch Form Details and School List
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await api.get(`/collections/public/${slug}`);
        setCollection(formRes.data);

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
      setIsSuccess(true);
      window.scrollTo(0, 0); // Scroll to top to see the success message
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Loading form...</div>;

  // If form is closed or not found
  if (!collection || message.type === 'error' && !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Unavailable</h1>
          <p className="text-gray-600">{message.text || 'This form does not exist or has been closed by the admin.'}</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border-t-4 border-green-500">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">Thank you. Your school's data has been received by the Sub-County office.</p>
          <button onClick={() => window.location.reload()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors">
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  // Group fields by their "group" property
  const groupedFields = collection.fields.reduce((acc, field) => {
    const group = field.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="bg-blue-900 rounded-t-xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-bold tracking-wider mb-2 uppercase">Ministry of Education - Kitui West</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{collection.name}</h1>
            <p className="text-blue-100 font-medium">Term: {collection.term}</p>
            {collection.description && <p className="mt-3 text-sm bg-blue-800/50 inline-block px-3 py-1 rounded">{collection.description}</p>}
          </div>
          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-blue-800 rounded-full opacity-50 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 md:p-8 border-x border-b border-gray-200 rounded-b-xl shadow-sm">
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-md border-l-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'}`}>
              {message.text}
            </div>
          )}

          {/* STEP 1: Select School */}
          <div className="mb-8 bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
            <label className="block text-gray-800 font-bold mb-2">Select Your School <span className="text-red-500">*</span></label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            >
              <option value="">-- Search and select your school --</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} ({s.zone} Zone)
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: Dynamic Form Fields grouped in Cards */}
          <div className="space-y-6">
            {Object.entries(groupedFields).map(([groupName, fields]) => (
              <div key={groupName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-blue-900">{groupName}</h2>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={answers[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          required={field.required}
                          value={answers[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder={field.type === 'number' ? 'Enter number' : 'Enter details'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* STEP 3: Submit */}
          <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold text-lg shadow-md transition-colors"
            >
              {submitting ? 'Submitting Data...' : 'Submit Data'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 text-xs text-gray-500">
          Powered by Kitui West Sub-County Data Portal
        </div>
      </div>
    </div>
  );
}
