import React, { useState } from 'react';
import { createSalesForecast } from '../../services/addSalesForecastApi';
import type { SalesForecastPayload } from '../../type/addSalesForecast';
import { toast } from 'react-toastify';
import { useAuth } from '@/auth/AuthContext';

const initialFormState: SalesForecastPayload = {
  forecastName: '',
  forecastType: '',
  forecastStatus: 'Draft',
  forecastDescription: '',
  period: { startDate: '', endDate: '' },
  forecastYear: new Date().getFullYear() || 0,
  forecastQuarter: '',
  salesRegion: '',
  salesTerritory: '',
  salesTeam: '',
  salesManager: '',
  salesRepresentative: '',
  customerSegment: '',
  productCategory: '',
  forecastRevenue: 0,
  targetRevenue: 0,
  expectedRevenue: 0,
  minimumRevenue: 0,
  maximumRevenue: 0,
  currency: 'INR',
  expectedDeals: 0,
  openOpportunities: 0,
  expectedCustomers: 0,
  averageDealSize: 0,
  pipelineValue: 0,
  expectedCloseRate: 0,
  forecastMethod: '',
  confidenceLevel: 0,
  riskLevel: '',
  businessAssumptions: '',
  marketAssumptions: '',
  growthExpectations: '',
  challenges: '',
  opportunities: '',
  forecastOwner: '',
  reviewer: '',
  approver: '',
  approvalDeadline: '',
  internalNotes: '',
  remarks: ''
};

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-6 bg-base-100 rounded-xl border border-base-300 text-sm overflow-hidden shadow-sm">
    <div className="bg-base-200/50 px-4 py-3 border-b border-base-300 font-semibold text-base-content">
      {title}
    </div>
    <div className="p-4 space-y-1">
      {children}
    </div>
  </div>
);

const FormRow = ({ label, required, error, children }: any) => (
  <div className="flex flex-col md:flex-row py-2 border-b border-base-200 last:border-0 items-start md:items-center">
    <div className="w-full md:w-[180px] flex-shrink-0 font-medium text-base-content/90 mb-1 md:mb-0">
      {label} {required && <span className="text-error">*</span>}
    </div>
    <div className="flex-1 w-full max-w-2xl">
      {children}
      {error && <span className="text-error text-xs block mt-1">{error}</span>}
    </div>
  </div>
);

export default function AddSalesForecast() {
  const { auth } = useAuth();
  const slug = auth?.slug || 'default-tenant';
  const [formData, setFormData] = useState<SalesForecastPayload>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileKey, setFileKey] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    
    if (type === 'number' || type === 'range') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    if (name === 'startDate' || name === 'endDate') {
      setFormData(prev => ({ ...prev, period: { ...prev.period, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.forecastName.trim()) newErrors.forecastName = 'Forecast Name is required';
    if (!formData.forecastType) newErrors.forecastType = 'Forecast Type is required';
    if (!formData.period.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.period.endDate) newErrors.endDate = 'End Date is required';
    if (!formData.forecastRevenue) newErrors.forecastRevenue = 'Forecast Revenue is required';
    if (!formData.targetRevenue) newErrors.targetRevenue = 'Target Revenue is required';
    if (!formData.salesRegion) newErrors.salesRegion = 'Sales Region is required';
    if (!formData.forecastMethod) newErrors.forecastMethod = 'Forecast Method is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    try {
      await createSalesForecast(slug , formData);
      toast.success('Forecast Created Successfully!');
      handleReset();
    } catch (err) {
      console.error(err);
      alert('Failed to submit forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setFiles(null);
    setFileKey(Date.now());
  };

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-8 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-base-content">New Sales Forecast</h1>
        
        <form onSubmit={handleSubmit}>
          
          <FormSection title="SECTION 1: FORECAST INFORMATION">
            <FormRow label="Forecast Name" required error={errors.forecastName}>
              <input type="text" name="forecastName" value={formData.forecastName} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.forecastName ? 'input-error' : ''}`} />
            </FormRow>
            <FormRow label="Forecast Type" required error={errors.forecastType}>
              <select name="forecastType" value={formData.forecastType} onChange={handleInputChange} className={`select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.forecastType ? 'select-error' : ''}`}>
                <option value="" disabled>Select Type</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
                <option value="Custom">Custom</option>
              </select>
            </FormRow>
            <FormRow label="Forecast Status">
              <select name="forecastStatus" value={formData.forecastStatus} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
              </select>
            </FormRow>
            <FormRow label="Forecast Description">
              <textarea name="forecastDescription" value={formData.forecastDescription} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-20 text-sm" />
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 2: FORECAST PERIOD">
            <FormRow label="Start Date" required error={errors.startDate}>
              <input type="date" name="startDate" value={formData.period.startDate} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.startDate ? 'input-error' : ''}`} />
            </FormRow>
            <FormRow label="End Date" required error={errors.endDate}>
              <input type="date" name="endDate" value={formData.period.endDate} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.endDate ? 'input-error' : ''}`} />
            </FormRow>
            <FormRow label="Forecast Year" required error={errors.forecastYear}>
              <input type="number" name="forecastYear" value={formData.forecastYear || ''} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.forecastYear ? 'input-error' : ''}`} />
            </FormRow>
            <FormRow label="Forecast Quarter">
              <select name="forecastQuarter" value={formData.forecastQuarter} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="" disabled>Select Quarter</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 3: SALES SCOPE">
            <FormRow label="Sales Region" required error={errors.salesRegion}>
              <select name="salesRegion" value={formData.salesRegion} onChange={handleInputChange} className={`select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.salesRegion ? 'select-error' : ''}`}>
                <option value="" disabled>Select Region</option>
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
                <option value="LATAM">LATAM</option>
                <option value="Global">Global</option>
              </select>
            </FormRow>
            <FormRow label="Sales Territory">
              <select name="salesTerritory" value={formData.salesTerritory} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Territory</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North">North</option>
                <option value="South">South</option>
              </select>
            </FormRow>
            <FormRow label="Sales Team">
              <select name="salesTeam" value={formData.salesTeam} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Team</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="SMB">SMB</option>
              </select>
            </FormRow>
            <FormRow label="Sales Manager">
              <input list="sales-managers" name="salesManager" value={formData.salesManager} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" placeholder="Search Manager..." />
              <datalist id="sales-managers">
                <option value="Alice Johnson" />
                <option value="Bob Smith" />
                <option value="Charlie Davis" />
              </datalist>
            </FormRow>
            <FormRow label="Sales Representative">
              <input list="sales-reps" name="salesRepresentative" value={formData.salesRepresentative} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" placeholder="Search Representative..." />
              <datalist id="sales-reps">
                <option value="David Wilson" />
                <option value="Eva Green" />
                <option value="Frank White" />
              </datalist>
            </FormRow>
            <FormRow label="Customer Segment">
              <select name="customerSegment" value={formData.customerSegment} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Segment</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="SMB">SMB</option>
              </select>
            </FormRow>
            <FormRow label="Product Category">
              <select name="productCategory" value={formData.productCategory} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Category</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Services">Services</option>
              </select>
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 4: REVENUE FORECAST">
            <FormRow label="Forecast Revenue" required error={errors.forecastRevenue}>
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="forecastRevenue" value={formData.forecastRevenue || ''} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8 ${errors.forecastRevenue ? 'input-error' : ''}`} />
              </div>
            </FormRow>
            <FormRow label="Target Revenue" required error={errors.targetRevenue}>
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="targetRevenue" value={formData.targetRevenue || ''} onChange={handleInputChange} className={`input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8 ${errors.targetRevenue ? 'input-error' : ''}`} />
              </div>
            </FormRow>
            <FormRow label="Expected Revenue">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="expectedRevenue" value={formData.expectedRevenue || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8" />
              </div>
            </FormRow>
            <FormRow label="Minimum Revenue">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="minimumRevenue" value={formData.minimumRevenue || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8" />
              </div>
            </FormRow>
            <FormRow label="Maximum Revenue">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="maximumRevenue" value={formData.maximumRevenue || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8" />
              </div>
            </FormRow>
            <FormRow label="Currency">
              <select name="currency" value={formData.currency} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 5: OPPORTUNITY FORECAST">
            <FormRow label="Expected Deals">
              <input type="number" name="expectedDeals" value={formData.expectedDeals || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
            <FormRow label="Open Opportunities">
              <input type="number" name="openOpportunities" value={formData.openOpportunities || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
            <FormRow label="Expected Customers">
              <input type="number" name="expectedCustomers" value={formData.expectedCustomers || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
            <FormRow label="Average Deal Size">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="averageDealSize" value={formData.averageDealSize || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8" />
              </div>
            </FormRow>
            <FormRow label="Pipeline Value">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-base-content/60 font-medium">₹</span>
                <input type="number" name="pipelineValue" value={formData.pipelineValue || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full pl-8" />
              </div>
            </FormRow>
            <FormRow label="Expected Close Rate %">
              <input type="number" name="expectedCloseRate" value={formData.expectedCloseRate || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 6: FORECAST METHOD">
            <FormRow label="Forecast Method" required error={errors.forecastMethod}>
              <select name="forecastMethod" value={formData.forecastMethod} onChange={handleInputChange} className={`select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full ${errors.forecastMethod ? 'select-error' : ''}`}>
                <option value="" disabled>Select Method</option>
                <option value="Pipeline Based">Pipeline Based</option>
                <option value="Historical Trend">Historical Trend</option>
                <option value="Manual Projection">Manual Projection</option>
                <option value="AI Prediction">AI Prediction</option>
                <option value="Weighted Forecast">Weighted Forecast</option>
              </select>
            </FormRow>
            <FormRow label="Confidence Level %">
              <input type="number" name="confidenceLevel" value={formData.confidenceLevel || ''} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
            <FormRow label="Risk Level">
              <select name="riskLevel" value={formData.riskLevel} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="" disabled>Select Risk</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 7: ASSUMPTIONS">
            <FormRow label="Business Assumptions">
              <textarea name="businessAssumptions" value={formData.businessAssumptions} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-16 text-sm" />
            </FormRow>
            <FormRow label="Market Assumptions">
              <textarea name="marketAssumptions" value={formData.marketAssumptions} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-16 text-sm" />
            </FormRow>
            <FormRow label="Growth Expectations">
              <textarea name="growthExpectations" value={formData.growthExpectations} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-16 text-sm" />
            </FormRow>
            <FormRow label="Challenges">
              <textarea name="challenges" value={formData.challenges} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-16 text-sm" />
            </FormRow>
            <FormRow label="Opportunities">
              <textarea name="opportunities" value={formData.opportunities} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-16 text-sm" />
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 8: APPROVAL INFORMATION">
            <FormRow label="Forecast Owner">
              <select name="forecastOwner" value={formData.forecastOwner} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Owner</option>
                <option value="Manager A">Manager A</option>
                <option value="Manager B">Manager B</option>
              </select>
            </FormRow>
            <FormRow label="Reviewer">
              <select name="reviewer" value={formData.reviewer} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Reviewer</option>
                <option value="Director A">Director A</option>
                <option value="Director B">Director B</option>
              </select>
            </FormRow>
            <FormRow label="Approver">
              <select name="approver" value={formData.approver} onChange={handleInputChange} className="select select-bordered select-sm border-base-300 bg-base-100 rounded-lg w-full">
                <option value="">Select Approver</option>
                <option value="VP Sales">VP Sales</option>
                <option value="CEO">CEO</option>
              </select>
            </FormRow>
            <FormRow label="Approval Deadline">
              <input type="date" name="approvalDeadline" value={formData.approvalDeadline} onChange={handleInputChange} className="input input-bordered input-sm border-base-300 bg-base-100 rounded-lg w-full" />
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 9: ATTACHMENTS">
            <FormRow label="File Upload">
              <input key={fileKey} type="file" multiple accept=".pdf,.xlsx,.csv,.docx" onChange={(e) => setFiles(e.target.files)} className="file-input file-input-bordered file-input-sm border-base-300 bg-base-100 rounded-lg w-full" />
              {files && files.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {Array.from(files).map((file, i) => (
                    <li key={i} className="text-sm flex items-center gap-2 text-base-content/80">
                      <span>📄</span> {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </FormRow>
          </FormSection>

          <FormSection title="SECTION 10: NOTES">
            <FormRow label="Internal Notes">
              <textarea name="internalNotes" value={formData.internalNotes} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-20 text-sm" />
            </FormRow>
            <FormRow label="Remarks">
              <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} className="textarea textarea-bordered border-base-300 bg-base-100 rounded-lg w-full h-20 text-sm" />
            </FormRow>
          </FormSection>

          <div className="flex gap-3 pt-2 pb-10">
            <button type="submit" className="btn btn-success rounded-lg px-8" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Submit'}
            </button>
            <button type="button" className="btn btn-outline rounded-lg px-8" onClick={handleReset} disabled={loading}>
              Reset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}