import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

function CreateListingPage() {
  const { id } = useParams(); // agar id bo'lsa - tahrirlash rejimi
  const isEditMode = Boolean(id);
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', address: '',
    contact_phone: '', category: '',
    room_count: '', area: '',
    amenities: [],
    floor: '', total_floors: '', year_built: '',
    has_documents: false, has_gas: false, has_electricity: false, has_internet: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [floorPlanImage, setFloorPlanImage] = useState(null); // yangi tanlangan fayl
  const [existingFloorPlanUrl, setExistingFloorPlanUrl] = useState(null); // tahrirlashda mavjud rasm
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data));
    api.get('/amenities/').then((res) => setAmenities(res.data));
  }, []);

  // Tahrirlash rejimida - mavjud ma'lumotlarni yuklab, formaga to'ldirish
  useEffect(() => {
    if (isEditMode) {
      api.get(`/listings/${id}/`).then((res) => {
        const data = res.data;
        setForm({
          title: data.title,
          description: data.description,
          price: data.price,
          address: data.address,
          contact_phone: data.contact_phone,
          category: data.category?.id || '',
          room_count: data.room_count ?? '',
          area: data.area ?? '',
          amenities: data.amenities.map((a) => a.id),
          floor: data.floor ?? '',
          total_floors: data.total_floors ?? '',
          year_built: data.year_built ?? '',
          has_documents: data.has_documents,
          has_gas: data.has_gas,
          has_electricity: data.has_electricity,
          has_internet: data.has_internet,
        });
        setExistingFloorPlanUrl(data.floor_plan_image || null);
        setLoading(false);
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const toggleAmenity = (amenityId) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenityId)
          : [...prev.amenities, amenityId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Fayl (floor_plan_image) borligi uchun FormData ishlatamiz
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('address', form.address);
    formData.append('contact_phone', form.contact_phone);
    formData.append('category', form.category);

    formData.append('room_count', form.room_count === '' ? '' : form.room_count);
    formData.append('area', form.area === '' ? '' : form.area);
    formData.append('floor', form.floor === '' ? '' : form.floor);
    formData.append('total_floors', form.total_floors === '' ? '' : form.total_floors);
    formData.append('year_built', form.year_built === '' ? '' : form.year_built);

    formData.append('has_documents', form.has_documents);
    formData.append('has_gas', form.has_gas);
    formData.append('has_electricity', form.has_electricity);
    formData.append('has_internet', form.has_internet);

    // Ko'p qiymatli maydon - har bir amenity alohida qo'shiladi
    form.amenities.forEach((a) => formData.append('amenities', a));

    // Sxema rasmi faqat foydalanuvchi yangi fayl tanlagandagina yuboriladi (ixtiyoriy)
    if (floorPlanImage) {
      formData.append('floor_plan_image', floorPlanImage);
    }

    try {
      if (isEditMode) {
        await api.patch(`/listings/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/listing/${id}`);
      } else {
        const res = await api.post('/listings/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/listing/${res.data.id}/add-room`);
      }
    } catch (err) {
      console.error(err);
      setError(t('createListing.error'));
    }
  };

  if (loading) return <p>{t('home.loading')}</p>;

  return (
    <div className="form-page wide fade-up">
      <div className="form-card">
        <h2>{isEditMode ? t('createListing.editTitle') : t('createListing.createTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="field-label">{t('createListing.listingTitle')}</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label className="field-label">{t('createListing.description')}</label>
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label className="field-label">{t('createListing.price')}</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label className="field-label">{t('createListing.address')}</label>
            <input name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label className="field-label">{t('createListing.contactPhone')}</label>
            <input name="contact_phone" value={form.contact_phone} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">{t('createListing.roomCount')}</label>
              <input type="number" name="room_count" value={form.room_count} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="field-label">{t('createListing.area')}</label>
              <input type="number" step="0.1" name="area" value={form.area} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">{t('createListing.category')}</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">{t('createListing.chooseCategory')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Qulayliklar */}
          <div className="form-field">
            <label className="field-label">{t('createListing.amenities')}</label>
            <div className="amenity-checklist">
              {amenities.map((a) => (
                <label key={a.id} className="amenity-chip">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </div>

          {/* Qo'shimcha ma'lumot */}
          <label className="field-label">{t('createListing.additionalInfo')}</label>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">{t('createListing.floor')}</label>
              <input type="number" name="floor" value={form.floor} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="field-label">{t('createListing.totalFloors')}</label>
              <input type="number" name="total_floors" value={form.total_floors} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="field-label">{t('createListing.yearBuilt')}</label>
              <input type="number" name="year_built" value={form.year_built} onChange={handleChange} />
            </div>
          </div>

          <div className="checkbox-grid">
            <label className="checkbox-row">
              <input type="checkbox" name="has_documents" checked={form.has_documents} onChange={handleCheckboxChange} />
              {t('createListing.hasDocuments')}
            </label>
            <label className="checkbox-row">
              <input type="checkbox" name="has_gas" checked={form.has_gas} onChange={handleCheckboxChange} />
              {t('createListing.hasGas')}
            </label>
            <label className="checkbox-row">
              <input type="checkbox" name="has_electricity" checked={form.has_electricity} onChange={handleCheckboxChange} />
              {t('createListing.hasElectricity')}
            </label>
            <label className="checkbox-row">
              <input type="checkbox" name="has_internet" checked={form.has_internet} onChange={handleCheckboxChange} />
              {t('createListing.hasInternet')}
            </label>
          </div>

          {/* Xonadon rejasi rasmi - ixtiyoriy, qo'lda yuklanadi */}
          <div className="form-field">
            <label className="field-label">
              {t('listingDetail.floorPlanTitle')} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({t('createListing.optional')})</span>
            </label>
            <label className="file-upload" htmlFor="floor-plan-file">
              <span className="file-upload-btn">📁 {t('addRoom.chooseFile')}</span>
              <span className="file-upload-name">
                {floorPlanImage
                  ? floorPlanImage.name
                  : existingFloorPlanUrl
                    ? t('createListing.currentFile')
                    : t('addRoom.noFileChosen')}
              </span>
            </label>
            <input
              id="floor-plan-file"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setFloorPlanImage(e.target.files[0])}
              className="file-upload-input"
            />
            {existingFloorPlanUrl && !floorPlanImage && (
              <img src={existingFloorPlanUrl} alt="floor plan" className="floor-plan-current-preview" />
            )}
          </div>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            {isEditMode ? t('createListing.save') : t('createListing.nextStep')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateListingPage;