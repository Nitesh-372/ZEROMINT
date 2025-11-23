import React, { useState } from "react";
import Topbar from "../components/Topbar.jsx";
import { client } from "../utils/api.js";

export default function AddProject() {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  // ⚠️ Hardhat account #0 wallet (for demo + blockchain registration)
  const OWNER_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  async function handleSubmit() {
    try {
      const formData = new FormData();
      formData.append("projectType", type);
      formData.append("projectName", name);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("creditsRequested", credits);
      formData.append("ownerWallet", OWNER_WALLET);
      if (file) formData.append("evidence", file);

      const { data } = await client.post("/projects", {
    title,
    description,
    creditsRequested,
    ownerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"   // Hardhat account #0
})


      setMessage("🎉 Project submitted & registered on blockchain!");
      console.log("Success:", data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error submitting project");
    }
  }

  return (
    <div className="space-y-5">
      <Topbar />

      <div className="card max-w-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Project</h2>

        <div className="space-y-4">

          {/* Project Type */}
          <div>
            <label className="block text-sm font-semibold mb-1">Project Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Select project type</option>
              <option>Solar Energy</option>
              <option>Wind Energy</option>
              <option>Forestation</option>
              <option>Biomass</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Project Name</label>
            <input
              className="input"
              placeholder="e.g., Downtown Solar Installation"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input
              className="input"
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">Project Description</label>
            <textarea
              className="input"
              rows="4"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Credits */}
          <div>
            <label className="block text-sm font-semibold mb-1">Expected Carbon Credits</label>
            <input
              className="input"
              placeholder="e.g., 150"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-1">Upload Evidence</label>
            <input
              type="file"
              className="input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* Submit button */}
          <button className="btn btn-primary w-full" onClick={handleSubmit}>
            Submit Project for Verification
          </button>

          {message && <p className="text-center text-sm mt-3">{message}</p>}
        </div>
      </div>
    </div>
  );
}
