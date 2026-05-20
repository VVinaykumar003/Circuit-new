import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import { updateProject } from "@/services/projectServices";
import { getMembers } from "@/services/memberService";

interface Props {
  project: any;
  onUpdateProject?: (updatedProject: any) => void;
}

export default function ProjectMembers({ project, onUpdateProject }: Props) {
  const { auth } = useAuth();
  const participants = project?.participants || [];

  const [showModal, setShowModal] = useState(false);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newParticipant, setNewParticipant] = useState({
    user: "",
    role: "",
    responsibility: "",
  });

  const roles = ["Member", "Manager"];
  const responsibilities = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Debugging",
    "Content",
    "Research",
    "Maintain",
    "UI Design",
    "Testing",
    "Deployment",
  ];

  // Fetch organization members for the dropdown
  useEffect(() => {
    if (showModal && orgUsers.length === 0) {
         getMembers(auth.slug)
        .then((res) => setOrgUsers(res.data.members || res.data.users || []))
        .catch((err) => console.error("Failed to fetch org members", err));
      //
      // API.get(`/${auth.slug}/getMembers`)
      //   .then((res) => setOrgUsers(res.data.members || res.data.users || []))
      //   .catch((err) => console.error("Failed to fetch org members", err));
    }
  }, [showModal, auth.slug]);

  const handleSaveParticipant = async (isAdding: boolean, userIdToRemove?: string) => {
    try {
      setLoading(true);

      // Map participants to just the IDs and roles for the backend update
      let updatedParticipants = participants.map((p: any) => ({
        user: p.user?._id || p.user,
        role: p.role,
        responsibility: p.responsibility,
      }));

      if (isAdding) {
        updatedParticipants.push(newParticipant);
      } else if (userIdToRemove) {
        updatedParticipants = updatedParticipants.filter((p: any) => p.user !== userIdToRemove);
      }

      const payload = {
        projectName: project.projectName || project.name,
        projectState: project.projectState || project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        domain: project.domain,
        customDomain: project.customDomain,
        description: project.description,
        participants: updatedParticipants,
      };

      await updateProject(auth.slug, project._id || project.id, payload);

      toast.success(isAdding ? "Member added successfully" : "Member removed successfully");

      if (onUpdateProject) {
        // Update the UI immediately without requiring a browser refresh
        const updatedProjectData = { ...project };
        if (isAdding) {
          const addedUser = orgUsers.find((u) => u._id === newParticipant.user);
          updatedProjectData.participants = [
            ...participants,
            { ...newParticipant, user: addedUser || { _id: newParticipant.user, name: "New User" } },
          ];
        } else if (userIdToRemove) {
          updatedProjectData.participants = participants.filter(
            (p: any) => (p.user?._id || p.user) !== userIdToRemove
          );
        }
        onUpdateProject(updatedProjectData);
      }

      setShowModal(false);
      setNewParticipant({ user: "", role: "", responsibility: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    if (!newParticipant.user || !newParticipant.role || !newParticipant.responsibility) {
      toast.error("Please select user, role, and responsibility");
      return;
    }

    if (participants.some((p: any) => (p.user?._id || p.user) === newParticipant.user)) {
      toast.error("User is already a member of this project");
      return;
    }

    handleSaveParticipant(true);
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this member from the project?")) {
      handleSaveParticipant(false, userId);
    }
  };

  return (
    <div className="bg-white/70 border border-base-300 rounded-lg p-6">
      <div className="flex justify-between mb-4 border-b border-base-300 pb-2">
        <h3 className="font-semibold text-base-content ">
          Team Members
        </h3>

        <button className="btn btn-sm btn-primary text-primary-content" onClick={() => setShowModal(true)}>
          + Add Member
        </button>
      </div>

      <ul className="divide-y divide-base-300">
        {participants.map((participant: any, index: number) => {
          const userId = participant.user?._id || participant.user;
          return (
            <li
              key={userId || index}
              className="py-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-base-content">
                  {participant.user?.name || "Unknown User"}
                </p>
                <p className="text-sm text-base-content/60">
                  {participant.role} {participant.responsibility ? `- ${participant.responsibility}` : ""}
                </p>
              </div>

              <button 
                className="btn btn-xs btn-error btn-outline"
                onClick={() => handleRemoveMember(userId)}
                disabled={loading}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 rounded-xl p-6 w-full max-w-md shadow-xl border border-base-300">
            <h3 className="text-lg font-semibold mb-4">Add Project Member</h3>
            <div className="space-y-4">
              <select
                className="select select-bordered w-full"
                value={newParticipant.user}
                onChange={(e) => setNewParticipant({ ...newParticipant, user: e.target.value })}
              >
                <option value="">Select User</option>
                {orgUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered w-full"
                value={newParticipant.role}
                onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                className="select select-bordered w-full"
                value={newParticipant.responsibility}
                onChange={(e) => setNewParticipant({ ...newParticipant, responsibility: e.target.value })}
              >
                <option value="">Select Responsibility</option>
                {responsibilities.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={loading}>
                {loading ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
