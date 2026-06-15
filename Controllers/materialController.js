import Material from "../Models/materials.js";

export async function addMaterial(req, res) {
  try {
    if (!req.user || req.user.role !== "tutor") {
      return res.status(403).json({ error: "Only tutors can add materials" });
    }

    const { title, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const fileUrl = `/uploads/materials/${req.file.filename}`;

    const newMaterial = new Material({
      tutor: req.user._id,
      courseId:req.body.courseId,
      title:req.body.title,
      fileUrl,
    });

    await newMaterial.save();
    res.json({ message: "Material added successfully", material: newMaterial });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add material" });
  }
}


export async function getMaterials(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get the courseId from the query string (e.g., /api/materials/all?courseId=123)
        const { courseId } = req.query;

        // Build a filter object
        let filter = {};
        
        // If a courseId is provided, we only want materials for that course
        if (courseId) {
            filter.courseId = courseId;
        }

        if (req.user.role === "student") {
            // Students only see materials for this specific course
            const materials = await Material.find(filter);
            return res.json(materials);
        }

        if (req.user.role === "tutor") {
            // Tutors see their own materials, filtered by course if provided
            filter.tutor = req.user._id;
            const materials = await Material.find(filter);
            return res.json(materials);
        }

        if (req.user.role === "admin") {
            const materials = await Material.find(filter);
            return res.json(materials);
        }

        return res.status(403).json({ error: "Access denied" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve materials" });
    }
}

export async function deleteMaterial(req, res) {
    try {
        if(!req.user || req.user.role !== "tutor"){
            return res.status(403).json({ error: "Only tutors can delete materials" });
        }
        const materialId = req.params.id;

        const material = await Material.findById(materialId);
        if(!material){
            return  res.status(404).json({ error: "Material not found" });
        }
        if(material.tutor.toString() !== req.user._id.toString()){
            return res.status(403).json({ error: "You can only delete your own materials" });
        }
        await Material.findByIdAndDelete(materialId);
        res.json({ message: "Material deleted successfully" });
    } catch(error){
        console.error(error);
        res.status(500).json({ error: "Failed to delete material" });
    }
}

export async function updateMaterial(req, res) {
    try {
        if(!req.user || req.user.role !== "tutor"){
            return res.status(403).json({ error: "Only tutors can update materials" });
        }
        const materialId = req.params.id;
        const { title, fileUrl} = req.body;
        const material = await Material.findById(materialId);
        if(!material){
            return  res.status(404).json({ error: "Material not found" });
        }
        if(material.tutor.toString() !== req.user._id.toString()){
            return res.status(403).json({ error: "You can only update your own materials" });
        }
        material.title = title || material.title;
        material.fileUrl = fileUrl || material.fileUrl;
        await material.save();
        res.json({ message: "Material updated successfully" });
    } catch(error){
        console.error(error);
        res.status(500).json({ error: "Failed to update material" });
    }
}