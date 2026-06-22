// import { useEffect, useRef, useState } from "react";
// import { addWorkUpdate } from "@/services/workUpdateService";
// import { getProject } from "@/services/projectServices";
// import { toast } from "react-toastify";

// interface Project {
//   _id: string;
//   projectName: string;
// }

// interface WorkUpdateFormProps {
//   slug: string;
// }

// const WorkUpdateForm = ({ slug }: WorkUpdateFormProps) => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);
// const fileInputRef = useRef<HTMLInputElement | null>(null);
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const data = await getProject(slug);
//         console.log("Fetched projects:", data);
//         setProjects(data.data.projects || []);
//       } catch (error) {
//         console.error("Failed to fetch projects:", error);
//       }
//     };

//     fetchProjects();
//   }, [slug]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setAttachments(Array.from(e.target.files));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!selectedProjectId) {
//       alert("Please select a project");
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("description", description);

//       attachments.forEach((file) => {
//         formData.append("attachments", file);
//       });
//       for (let pair of formData.entries()) {
//         console.log(pair[0], pair[1]);
//       }
//       const response = await addWorkUpdate(selectedProjectId, slug, formData);

//       toast.success(response.message || "Work update submitted successfully");

//       setSelectedProjectId("");
//       setDescription("");
//       setAttachments([]);

// if (fileInputRef.current) {
//   fileInputRef.current.value = "";
// }
//     } catch (error) {
//       console.error("Error submitting work update:", error);
//       toast.error("Failed to submit work update");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//    <div className="max-w-2xl mx-auto bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
  
//   <h2 className="text-sm font-medium text-base-content mb-6">
//     Submit Work Update
//   </h2>

//   <form onSubmit={handleSubmit} className="space-y-5">
    
//     {/* Project Dropdown */}
//     <div>
//       <label className="block text-xs font-medium text-base-content/70 mb-2">
//         Project
//       </label>

//       <select
//         value={selectedProjectId}
//         onChange={(e) => setSelectedProjectId(e.target.value)}
//         className="w-full px-4 py-3 text-sm bg-base-100 text-base-content border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
//         required
//       >
//         <option value="">Select a project</option>
//         {projects.map((project) => (
//           <option key={project._id} value={project._id}>
//             {project.projectName}
//           </option>
//         ))}
//       </select>
//     </div>

//     {/* Description */}
//     <div>
//       <label className="block text-xs font-medium text-base-content/70 mb-2">
//         Work Description
//       </label>

//       <textarea
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         placeholder="Describe today's progress..."
//         rows={5}
//         className="w-full px-4 py-3 text-sm bg-base-100 text-base-content border border-base-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
//         required
//       />
//     </div>

//     {/* Attachments */}
//     <div>
//       <label className="block text-xs font-medium text-base-content/70 mb-2">
//         Attach Files
//       </label>

//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="w-full text-sm text-base-content/70 
//         file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 
//         file:text-sm file:bg-base-200 file:text-base-content 
//         hover:file:bg-base-300"
//       />

//       {/* Selected files preview */}
//       {attachments.length > 0 && (
//         <div className="mt-2 space-y-1">
//           {attachments.map((file, i) => (
//             <p key={i} className="text-xs text-base-content/60">
//               📎 {file.name}
//             </p>
//           ))}
//         </div>
//       )}
//     </div>

//     {/* Submit Button */}
//     <div className="pt-2">
//       <button
//         type="submit"
//         disabled={loading}
//         className="px-6 py-3 text-sm font-medium bg-primary text-primary-content rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200"
//       >
//         {loading ? "Submitting..." : "Submit Update"}
//       </button>
//     </div>

//   </form>
// </div>
   
//   );
// };

// export default WorkUpdateForm;
import { useEffect, useRef, useState } from "react";
import { addWorkUpdate } from "@/services/workUpdateService";
import { getProject } from "@/services/projectServices";
import { toast } from "react-toastify";
import { MdClose, MdFolder, MdAssignment, MdLightbulbOutline, MdCheckCircle, MdOutlineAttachFile, MdCloudUpload } from "react-icons/md";

interface Project {
  _id: string;
  projectName: string;
}

interface WorkUpdateFormProps {
  slug: string;
  onSuccess?: () => void;
}

const WorkUpdateForm = ({ slug, onSuccess }: WorkUpdateFormProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProject(slug);
        setProjects(data.data.projects || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", description);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await addWorkUpdate(selectedProjectId, slug, formData);

      // Safely check for Axios res.data.message or fallback to res.message
      const successMessage = res?.data?.message || res?.message || "Update submitted successfully";
      toast.success(successMessage);

      setSelectedProjectId("");
      setDescription("");
      setAttachments([]);

      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to submit update";
      toast.error(errorMessage);
      console.error("Submit Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedProjectId("");
    setDescription("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onSuccess) onSuccess();
  };

  const getProgress = () => {
    let p = 0;
    if (selectedProjectId) p += 40;
    if (description.trim().length > 10) p += 40;
    if (attachments.length > 0) p += 20;
    return p;
  };

  const progress = getProgress();

  return (
    <div className="relative w-full bg-base-100 border border-base-200 shadow-xl rounded-[2rem] p-6 sm:p-8 lg:p-10 transition-shadow duration-300 hover:shadow-2xl overflow-hidden mx-auto max-w-6xl">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-base-100/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[2rem] animate-fade-in">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <h3 className="text-xl font-bold text-base-content">Submitting Update...</h3>
          <p className="text-sm text-base-content/60 mt-1">Please wait while your work update is recorded.</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pb-6 border-b border-base-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm border border-primary/20 shrink-0">
            <MdAssignment size={28} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
              Submit Work Update
            </h2>
            <p className="text-base-content/60 text-sm sm:text-base mt-1 max-w-xl">
              Share your daily progress, completed tasks, blockers, and attach necessary files to keep the team aligned.
            </p>
          </div>
        </div>
        <div className="badge badge-primary badge-outline py-4 px-4 font-semibold shadow-sm whitespace-nowrap hidden sm:flex">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Main Form */}
        <div className="col-span-1 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* PROJECT SELECTOR */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-base-content text-base">Project <span className="text-error">*</span></span>
              </label>
              <p className="text-xs text-base-content/50 mb-3 px-1">Choose the project you worked on today.</p>
              <div className="relative group">
                <MdFolder className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors" size={20} />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="select select-bordered w-full pl-12 h-12 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-base-100 text-base-content text-base font-medium"
                  required
                >
                  <option value="" disabled hidden>Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* WORK SUMMARY TEXTAREA */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-base-content text-base">Work Summary <span className="text-error">*</span></span>
              </label>
              <p className="text-xs text-base-content/50 mb-3 px-1">Describe completed tasks, progress, blockers, and achievements.</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Completed the authentication API, fixed the header bug, blocked on database access..."
                rows={6}
                className="textarea textarea-bordered w-full p-4 min-h-[160px] rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base-content text-base resize-y leading-relaxed"
                required
              />
              <div className="text-right mt-2 px-1">
                <span className={`text-xs font-medium transition-colors ${description.length > 10 ? 'text-success' : 'text-base-content/40'}`}>
                  {description.length} characters
                </span>
              </div>
            </div>

            {/* PREMIUM FILE UPLOAD */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-base-content text-base">Attachments</span>
              </label>
              <p className="text-xs text-base-content/50 mb-3 px-1">Attach relevant screenshots, documents, or logs.</p>
              
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-base-300 hover:border-primary/50 bg-base-200/30 hover:bg-primary/5 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <div className="w-16 h-16 bg-base-100 shadow-sm border border-base-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 transition-transform duration-300">
                  <MdCloudUpload size={32} className="text-base-content/40 group-hover:text-primary transition-colors"/>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-base-content mb-1">Click or drag files to upload</h3>
                <p className="text-sm text-base-content/50">Supported formats: PDF, DOCX, XLSX, PNG, JPG</p>
              </div>

              {/* ATTACHMENT PREVIEW CARDS */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                          <MdOutlineAttachFile size={18} />
                        </div>
                        <span className="text-sm font-semibold text-base-content truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-base-content/40 hover:text-error hover:bg-error/10 p-2 rounded-lg transition-colors shrink-0"
                        title="Remove file"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBMIT ACTIONS */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-base-200 mt-8">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn btn-ghost w-full sm:w-auto rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => toast.info("Draft saved locally (Coming Soon)")} 
                className="btn btn-outline border-base-300 w-full sm:w-auto rounded-xl hover:bg-base-200 hover:border-base-300 hover:text-base-content font-semibold"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading || !selectedProjectId || !description.trim()}
                className="btn btn-primary w-full sm:w-auto min-w-[160px] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all font-semibold"
              >
                {loading && <span className="loading loading-spinner loading-xs"></span>}
                {loading ? "Submitting..." : "Submit Update"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Tips & Progress Tracker */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* PROGRESS TRACKER */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-6">
              <h3 className="font-bold text-base-content mb-4 flex items-center gap-2 text-lg">
                <MdCheckCircle className="text-success" size={22} />
                Completion Status
              </h3>
              <div className="flex items-center justify-between text-sm mb-2 font-semibold">
                <span className="text-base-content/70">Progress</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <progress className="progress progress-primary w-full h-2.5" value={progress} max="100"></progress>
              
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedProjectId ? 'bg-success/20 text-success' : 'bg-base-200 text-base-content/30'}`}>✓</div>
                  <span className={selectedProjectId ? "text-base-content font-semibold" : "text-base-content/50"}>Project Selected</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${description.trim().length > 10 ? 'bg-success/20 text-success' : 'bg-base-200 text-base-content/30'}`}>✓</div>
                  <span className={description.trim().length > 10 ? "text-base-content font-semibold" : "text-base-content/50"}>Work Summary Added</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${attachments.length > 0 ? 'bg-success/20 text-success' : 'bg-base-200 text-base-content/30'}`}>✓</div>
                  <span className={attachments.length > 0 ? "text-base-content font-semibold" : "text-base-content/50"}>Files Attached (Optional)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* TIPS CARD */}
          <div className="card bg-info/5 border border-info/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-6">
              <h3 className="font-bold text-info flex items-center gap-2 mb-4 text-lg">
                <MdLightbulbOutline size={22} />
                Writing a Great Update
              </h3>
              <ul className="space-y-3 text-sm text-base-content/80 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-info mt-0.5 font-bold">•</span>
                  <span>Mention completed work and major milestones explicitly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-info mt-0.5 font-bold">•</span>
                  <span>Highlight any blockers preventing team progress.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-info mt-0.5 font-bold">•</span>
                  <span>Include important links to Docs, PRs, or tickets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-info mt-0.5 font-bold">•</span>
                  <span>Attach relevant design documents or error screenshots.</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WorkUpdateForm;