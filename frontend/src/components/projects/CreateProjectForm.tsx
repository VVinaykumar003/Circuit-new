import type { ProjectData } from "@/pages/CreateProject";
import React from "react";

interface Props {
  onNext: () => void;
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
}

const CreateProjectForm: React.FC<Props> = ({
  onNext,
  projectData,
  setProjectData,
}) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setProjectData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // page reload prevent

    onNext(); // go to participants tab
  };

  return (
    <form
      onSubmit={handleSubmit}
      // className="bg-gray-50 rounded-2xl p-6 space-y-6  text-gray-700"
      className="space-y-5 sm:space-y-6"
    >
      {/* Project Name */}
      <div>
        <label className="block mb-1 text-base-content/70 font-medium text-sm ">
          Project Name
        </label>
        <input
          required
          type="text"
          name="projectName"
          value={projectData.projectName}
          onChange={handleChange}
          //  className="w-full p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          className="w-full px-3 py-2 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary/20  transition-all duration-200 placeholder:text-base-content/60 text-base-content"
        />
      </div>

      {/* Project State */}
      <div>
        <label className="block mb-1 text-base-content/70 font-medium text-sm ">
          Project State
        </label>
        <select
          required
          name="projectState"
          value={projectData.projectState}
          onChange={handleChange}
          //  className="w-full p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          className=" select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none  px-3 py-2 rounded-xl   transition-all duration-200 placeholder:text-base-content/60 text-base-content "
        >
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-base-content/70 font-medium text-sm ">
            Start Date
          </label>
          <input
            required
            type="date"
            name="startDate"
            value={projectData.startDate}
            onChange={handleChange}
            //  className="w-full p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            className="w-full px-3 py-2 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary/20  transition-all duration-200 placeholder:text-base-content/60 text-base-content"
          />
        </div>

        <div>
          <label className="block mb-1 text-base-content/70 font-medium text-sm ">
            End Date
          </label>
          <input
            required
            type="date"
            name="endDate"
            value={projectData.endDate}
            onChange={handleChange}
            //  className="w-full p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            className="w-full px-3 py-2 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary/20  transition-all duration-200 placeholder:text-base-content/60 text-base-content"
          />
        </div>
      </div>

      {/* Domain */}
      <div>
        <label className="block mb-1 text-base-content/70 font-medium text-sm ">
          Project Domain
        </label>
        {/* <select
          required
          name="domain"
          value={projectData.domain}
          onChange={(e) => {
            const value = e.target.value;
            setProjectData((prev) => ({
              ...prev,
              domain: value,
              customDomain: value === "Other" ? "" : prev.customDomain,
            }));
          }}
          className="w-full px-4 py-3 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary/20  transition-all duration-200 placeholder:text-base-content/60 text-base-content"
        >
          <option value="">Select Domain</option>
          <option value="Web Development">Web Development</option>
          <option value="App Development">App Development</option>
          <option value="AI/ML">AI / ML</option>
          <option value="Social Media">Social Media</option>
          <option value="Block Chain">Block Chain</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Content Creation">Content Creation</option>
          <option value="Testing">Testing</option>
          <option value="Software Development">Software Development</option>
          <option value="Other  ">Other</option>
        </select> */}
        <select
          required
          name="domain"
          value={projectData.domain}
          onChange={(e) => {
            const value = e.target.value;
            setProjectData((prev) => ({
              ...prev,
              domain: value,
              customDomain: value === "Other" ? "" : prev.customDomain,
            }));
          }}
          className=" select w-full text-sm
   
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none  px-3 py-2 rounded-xl bg-base-100 border border-base-content/10 text-base-content "
        >
          <option value="">Select Domain</option>
          <option value="Web Development">Web Development</option>
          <option value="App Development">App Development</option>
          <option value="AI/ML">AI / ML</option>
          <option value="Social Media">Social Media</option>
          <option value="Block Chain">Block Chain</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Content Creation">Content Creation</option>
          <option value="Testing">Testing</option>
          <option value="Software Development">Software Development</option>
          <option value="Other">Other</option>
        </select>
        {projectData.domain === "Other" && (
          <input
            type="text"
            placeholder="Enter Custom Domain"
            value={projectData.customDomain || ""}
            onChange={(e) =>
              setProjectData((prev) => ({
                ...prev,
                customDomain: e.target.value,
              }))
            }
            className="w-full mt-3 px-4 py-3 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-base-content/60 text-base-content"
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 text-base-content/70 font-medium text-sm ">
          Description
        </label>
        <textarea
          required
          name="description"
          value={projectData.description}
          onChange={handleChange}
          rows={3}
          // className="w-full p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          className="w-full px-3 py-2 rounded-xl bg-base-100 border border-base-content/10 focus:outline-none focus:ring-2 focus:ring-primary/20  transition-all duration-200 placeholder:text-base-content/60 text-base-content"
        />
      </div>

      {/* Submit */}
      {/* <button
  type="submit"
  className="w-full font-semibold bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition shadow-sm"
>
  Add Participants
</button> */}

      <div className="pt-4 sm:pt-6">
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-primary text-primary-content font-semibold hover:opacity-90 transition-all shadow-md"
        >
          Add Participants
        </button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
