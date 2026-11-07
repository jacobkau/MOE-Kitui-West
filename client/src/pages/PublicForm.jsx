import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function PublicForm() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  // Searchable Dropdown State
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingData, setExistingData] = useState(false);
  
  // To store the selected school name for the success screen
  const [selectedSchoolName, setSelectedSchoolName] = useState('');

  // 1. Fetch Form Details and School List
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await api.get(`/collections/public/${slug}`);
        setCollection(formRes.data);

        if (schools.length === 0) {
          const schoolsRes = await api.get('/schools/public-list');
          setSchools(schoolsRes.data);
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'This form is no longer available.' });
        setCollection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 8000);
    return () => clearInterval(intervalId);
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectSchool = async (school) => {
    setSelectedSchool(school._id);
    setSelectedSchoolName(school.name);
    setSchoolSearch(`${school.name} (${school.code})`);
    setIsDropdownOpen(false);

    try {
      const checkRes = await api.get(`/submissions/check/${collection._id}/${school._id}`);
      if (checkRes.data.exists) {
        setExistingData(true);
        setAnswers(checkRes.data.answers || {});
      } else {
        setExistingData(false);
        setAnswers({}); 
      }
    } catch (err) {
      console.error("Error checking existing data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchool) {
      setMessage({ type: 'error', text: 'Please select your school from the list.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const dataToSubmit = { ...answers };
    const groupedFields = collection.fields.reduce((acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {});

    Object.entries(groupedFields).forEach(([groupName, fields]) => {
      const numberFields = fields.filter(f => f.type === 'number');
      if (numberFields.length > 0) {
        const groupTotal = numberFields.reduce((sum, f) => sum + (Number(answers[f.key]) || 0), 0);
        const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        dataToSubmit[totalKey] = groupTotal;
      }
    });

    try {
      await api.post(`/submissions/public/${slug}`, {
        schoolId: selectedSchool,
        answers: dataToSubmit,
      });
      setIsSuccess(true);
      window.scrollTo(0, 0); 
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Loading form...</div>;

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Unavailable</h1>
          <p className="text-gray-600">{message.text || 'This form has been closed by the Sub-County office.'}</p>
        </div>
      </div>
    );
  }

  // Professional Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200 text-center">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {existingData ? 'Data Updated Successfully' : 'Data Submitted Successfully'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              The Sub-County office has received your data.
            </p>

            {/* Official Receipt Box */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Submission Receipt</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">School:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSchoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Form:</span>
                  <span className="text-sm font-semibold text-gray-900">{collection.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-semibold text-gray-900">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Submit Another Response
              </button>
              <button 
                onClick={() => window.close()} 
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
          
          <p className="mt-8 text-center text-xs text-gray-500">
            Ministry of Education - Kitui West Sub-County
          </p>
        </div>
      </div>
    );
  }

  const groupedFields = collection.fields.reduce((acc, field) => {
    const group = field.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  const filteredSchools = schools.filter((s) => {
    const name = String(s.name || "").toLowerCase().trim();
    const code = String(s.code || "").toLowerCase().trim();
    const cat = String(s.category || "").toLowerCase().trim();
    const search = schoolSearch.toLowerCase().trim();
    const target = collection.targetCategory || "all";

    if (search !== "") {
      if (!name.includes(search) && !code.includes(search)) {
        return false; 
      }
    }

    if (target === 'all') return true; 

    const isPrimary = cat.includes('primary') && !cat.includes('private');
    const isPrivate = cat.includes('private');
    const isSecondary = cat.includes('secondary') || cat.includes('junior');
    const isSpecial = cat.includes('special');

    if (target === 'primary') return isPrimary || isSpecial;
    if (target === 'private') return isPrivate;
    if (target === 'secondary') return isSecondary;
    if (target === 'special') return isSpecial;
    if (target === 'primary_private') return isPrimary || isPrivate || isSpecial;
    if (target === 'primary_secondary') return isPrimary || isSecondary || isSpecial;

    return true; 
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Compact Professional Header */}
        <div className="bg-white border-t-4 border-blue-900 rounded-t-lg shadow-sm px-6 py-4 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Ministry of Education - Kitui West</p>
          <h1 className="text-xl font-bold text-gray-900">{collection.name}</h1>
          <p className="text-sm text-gray-600 mt-1">Term: {collection.term}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-b-lg shadow-sm border border-t-0 border-gray-200">
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-md border-l-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'}`}>
              {message.text}
            </div>
          )}

          {/* School Selection */}
          <div className="mb-8 relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Your School <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by school name or code..."
                value={schoolSearch}
                onChange={(e) => {
                  setSchoolSearch(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedSchool(''); 
                  setExistingData(false);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
                autoComplete="off" 
                required={!selectedSchool} 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(s => (
                    <div key={s._id} onClick={() => handleSelectSchool(s)} className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
                      <div className="font-bold text-gray-800 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.code} • {s.zone} Zone</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No schools found matching "{schoolSearch}".
                  </div>
                )}
              </div>
            )}
            {selectedSchool && (
              <div className="mt-3">
                <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  School Selected
                </p>
                {existingData && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md mt-3 text-sm">
                    <strong>Note:</strong> You have previously submitted data for this form. Submitting again will overwrite your previous entry.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            {Object.entries(groupedFields).map(([groupName, fields]) => {
              const numberFields = fields.filter(f => f.type === 'number');
              const groupTotal = numberFields.reduce((sum, f) => sum + (Number(answers[f.key]) || 0), 0);

              return (
                <div key={groupName} className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">{groupName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea 
                            required={field.required} 
                            value={answers[field.key] || ''} 
                            onChange={(e) => handleInputChange(field.key, e.target.value)} 
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                            rows="2" 
                          />
                        ) : (
                          <input 
                            type={field.type === 'number' ? 'number' : 'text'} 
                            required={field.required} 
                            value={answers[field.key] || ''} 
                            onChange={(e) => handleInputChange(field.key, e.target.value)} 
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                            placeholder={field.type === 'number' ? '0' : ''} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {numberFields.length > 0 && (
                    <div className="flex justify-end mt-4">
                      <span className="bg-blue-50 text-blue-800 text-sm font-bold px-4 py-2 rounded-md border border-blue-100">
                        Section Total: {groupTotal}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full md:w-auto bg-blue-900 text-white px-10 py-3 rounded-md hover:bg-blue-800 disabled:opacity-50 font-bold text-md shadow-sm transition-colors"
            >
              {submitting ? 'Submitting...' : (existingData ? 'Update Existing Data' : 'Submit Data')}
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