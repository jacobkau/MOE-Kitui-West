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

  // 1. Fetch Form Details and School List (LIVE UPDATES EVERY 8 SECONDS)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await api.get(`/collections/public/${slug}`);
        setCollection(formRes.data);
        
        // Only fetch schools once to save bandwidth, unless they are empty
        if (schools.length === 0) {
          const schoolsRes = await api.get('/schools/public-list');
          setSchools(schoolsRes.data);
        }
      } catch (err) {
        // If the form gets closed while they are filling it, show the error
        setMessage({ type: 'error', text: err.response?.data?.message || 'This form is no longer available.' });
        setCollection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Setup live polling
    const intervalId = setInterval(fetchData, 8000);

    return () => clearInterval(intervalId);
  }, [slug]); // Removed 'schools' from dependency to avoid infinite loops

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

  // If form is closed or not found
  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Unavailable</h1>
          <p className="text-gray-600">{message.text || 'This form has been closed by the Sub-County office.'}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border-t-4 border-green-500">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{existingData ? 'Data Updated!' : 'Data Submitted!'}</h1>
          <p className="text-gray-600 mb-6">Thank you. Your data has been received by the Sub-County office.</p>
          <button onClick={() => window.location.reload()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200">Submit Another</button>
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

  // SAFE FILTER LOGIC (Prevents the toLowerCase crash)
  const filteredSchools = schools.filter((s) => {
    const search = schoolSearch.toLowerCase().trim();
    const name = (s.name || "").toLowerCase();
    const code = (s.code || "").toLowerCase();
    const cat = (s.category || "").toLowerCase();
    const target = collection.targetCategory || "all";

    // 1. Check if matches search
    const matchesSearch = name.includes(search) || code.includes(search);
    if (!matchesSearch) return false;

    // 2. Check if matches target category
    let matchesTarget = false;
    if (target === 'all') matchesTarget = true;
    else if (target === 'primary' && cat.includes('primary')) matchesTarget = true;
    else if (target === 'private' && cat.includes('private')) matchesTarget = true;
    else if (target === 'secondary' && (cat.includes('secondary') || cat.includes('junior'))) matchesTarget = true;
    else if (target === 'primary_private' && (cat.includes('primary') || cat.includes('private'))) matchesTarget = true;
    else if (target === 'primary_secondary' && (cat.includes('primary') || cat.includes('secondary') || cat.includes('junior'))) matchesTarget = true;
    
    // If the database is missing a category but target is 'all', allow it. 
    // Otherwise, strictly enforce the target.
    if (target === 'all') return true;
    return matchesTarget;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="bg-blue-900 rounded-t-xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-bold tracking-wider mb-2 uppercase">Ministry of Education - Kitui West</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{collection.name}</h1>
            <p className="text-blue-100 font-medium">Term: {collection.term}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 md:p-8 border-x border-b border-gray-200 rounded-b-xl shadow-sm">
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-md border-l-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'}`}>
              {message.text}
            </div>
          )}

          <div className="mb-8 bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500 relative" ref={dropdownRef}>
            <label className="block text-gray-800 font-bold mb-2">Search and Select Your School <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type full school name..."
                value={schoolSearch}
                onChange={(e) => {
                  setSchoolSearch(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedSchool(''); 
                  setExistingData(false);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10 text-lg font-medium"
                autoComplete="off" 
                required={!selectedSchool} 
              />
            </div>
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(s => (
                    <div key={s._id} onClick={() => handleSelectSchool(s)} className="p-3 border-b cursor-pointer hover:bg-blue-50">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.code} • {s.zone} Zone</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-red-500">No schools found matching your search.</div>
                )}
              </div>
            )}
            {selectedSchool && (
              <div className="mt-2">
                <p className="text-sm text-green-600 font-bold flex items-center gap-1">✓ Selected Successfully</p>
                {existingData && (
                  <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded mt-2 font-medium">
                    ⚠️ Pre-filled with previous submission. Submitting again will overwrite it.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {Object.entries(groupedFields).map(([groupName, fields]) => {
              const numberFields = fields.filter(f => f.type === 'number');
              const groupTotal = numberFields.reduce((sum, f) => sum + (Number(answers[f.key]) || 0), 0);

              return (
                <div key={groupName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 px-5 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-blue-900">{groupName}</h2>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                      {fields.map((field) => (
                        <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea required={field.required} value={answers[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full p-2 border rounded-md" rows="2" />
                          ) : (
                            <input type={field.type === 'number' ? 'number' : 'text'} required={field.required} value={answers[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full p-2 border rounded-md" placeholder={field.type === 'number' ? '0' : ''} />
                          )}
                        </div>
                      ))}
                    </div>
                    {numberFields.length > 0 && (
                      <div className="flex justify-end pt-3 border-t border-gray-100">
                        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-1.5 rounded-full">
                          Auto-Calculated Total: {groupTotal}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end">
            <button type="submit" disabled={submitting} className="w-full md:w-auto bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold text-lg shadow-md">
              {submitting ? 'Submitting...' : (existingData ? 'Update Data' : 'Submit Data')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
