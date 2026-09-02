export type OrganizationMember = {
  customDepartment: string | null;
  department: string | null;
  email: string;
  imageUrl: string;
  name: string;
  organization: string; // Represents your MongoDB/Hex ObjectId string
  role: "owner" | "admin" | "member"; // Restricted to specific role strings
  slug: string;
  userId: string;       // Represents your MongoDB/Hex ObjectId string
  _id?: string;
};

// Example usage with your data:
// const userProfile: OrganizationMember = {
//   customDepartment: null,
//   department: null,
//   email: "vvinaykumar3000@gmail.com",
//   imageUrl: "https://res.cloudinary.com/du2144ejj/image/upload/v1781605770/circuit_uploads/k65l8ehlyyxjs0vhtkzv.jpg",
//   name: "Vinay kumar",
//   organization: "6a0d7aa1012de34addf46fa8",
//   role: "owner",
//   slug: "abc-private-lmitied",
//   userId: "6a0d7aa1012de34addf46faa"
// };
