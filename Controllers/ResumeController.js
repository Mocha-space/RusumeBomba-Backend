import db from '../Config/Database.js';
import PDFDocument from 'pdfkit';

const RESUME_TEMPLATES = {
  modern: {
    id: 1,
    name: 'Modern Tech',
    styles: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    structure: {
      professionalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      },
      summary: '',
      workExperience: [],
      education: [],
      certifications: [],
      projects: [],
      skills: [],
    },
  },
  corporate: {
    id: 2,
    name: 'Corporate World',
    styles: {
      primaryColor: '#003366',
      secondaryColor: '#666666',
      backgroundColor: '#ffffff',
      fontFamily: 'Times-Roman',
    },
    structure: {
      professionalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      },
      summary: '',
      workExperience: [],
      education: [],
      certifications: [],
      awards: [],
      skills: [],
    },
  },
  creative: {
    id: 3,
    name: 'Creative World',
    styles: {
      primaryColor: '#b300b3',
      secondaryColor: '#ff66a3',
      backgroundColor: '#ffffff',
      fontFamily: 'Courier',
    },
    structure: {
      professionalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      },
      summary: '',
      workExperience: [],
      education: [],
      certifications: [],
      awards: [],
      skills: [],
    },
  },
};

const generatePDF = (doc, content) => {
  // Helper: Draw a thick horizontal line for section separation.
  const drawLine = (doc) => {
    const pageWidth = doc.page.width;
    doc.lineWidth(3);
    doc.moveTo(40, doc.y).lineTo(pageWidth - 40, doc.y).stroke();
    doc.moveDown(0.5);
  };

  // Helper: Draw a single skill pill and return new x position and y if wrapped.
  const drawSkillPill = (doc, skill, x, y, maxWidth) => {
    const padding = 4;
    doc.font('Helvetica').fontSize(12);
    const textWidth = doc.widthOfString(skill);
    const pillWidth = textWidth + 2 * padding;
    if (x + pillWidth > maxWidth) {
      x = 40;
      y += 24;
    }
    doc.roundedRect(x, y, pillWidth, 20, 4).stroke();
    doc.text(skill, x + padding, y + 4, { lineBreak: false });
    return { x: x + pillWidth + 4, y };
  };

  // Helper: Draw skills as pill-styled boxes.
  const drawSkills = (doc, skills) => {
    let x = 40;
    let y = doc.y;
    const maxWidth = doc.page.width - 40;
    skills.forEach((skill) => {
      const pos = drawSkillPill(doc, skill, x, y, maxWidth);
      x = pos.x;
      y = pos.y;
    });
    doc.moveDown(2);
  };

  // Header
  doc.fontSize(24).font('Helvetica-Bold')
     .text(content.professionalInfo.name || '', { align: 'center' });
  if (content.professionalInfo.role) {
    doc.moveDown(0.2);
    doc.fontSize(18).font('Helvetica')
       .text(content.professionalInfo.role, { align: 'center' });
  }
  doc.moveDown(0.5);

  // Contact Info
  const phoneStr = content.professionalInfo.phone ? "☎ " + content.professionalInfo.phone : "";
  const contactInfoArr = [
    content.professionalInfo.email,
    phoneStr,
    content.professionalInfo.location,
    content.professionalInfo.linkedin,
  ].filter(Boolean);
  const contactInfo = contactInfoArr.join(' | ');
  doc.fontSize(12).font('Helvetica')
     .text(contactInfo, { align: 'center' });
  doc.moveDown(1);

  // Summary
  if (content.summary) {
    doc.fontSize(16).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
    drawLine(doc);
    doc.fontSize(12).font('Helvetica').text(content.summary);
    doc.moveDown(1);
  }

  // Work Experience
  if (content.workExperience?.length) {
    doc.fontSize(16).font('Helvetica-Bold').text('WORK EXPERIENCE');
    drawLine(doc);
    content.workExperience.forEach((exp) => {
      doc.fontSize(14).font('Helvetica-Bold').text(exp.position || '');
      doc.fontSize(12).font('Helvetica').text(
        `${exp.company || ''}${exp.location ? `, ${exp.location}` : ''}`
      );
      const formatDate = (date) =>
        date === 'Present'
          ? 'Present'
          : new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      doc.text(`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`);
      doc.moveDown(0.5);
      exp.achievements?.forEach((ach) => {
        doc.text(`• ${ach}`, { indent: 20 });
      });
      doc.moveDown(1);
    });
  }

  // Education
  if (content.education?.length) {
    doc.fontSize(16).font('Helvetica-Bold').text('EDUCATION');
    drawLine(doc);
    content.education.forEach((edu) => {
      doc.fontSize(14).font('Helvetica-Bold').text(edu.school || '');
      doc.fontSize(12).font('Helvetica').text(edu.degree || '');
      const formatDate = (date) =>
        date === 'Present'
          ? 'Present'
          : new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (edu.startDate || edu.endDate) {
        doc.text(`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`);
      }
      doc.moveDown(1);
    });
  }

  // For modern templates, render Projects; for others, render Awards.
  if (content.projects?.length && content.template === "modern") {
    doc.fontSize(16).font('Helvetica-Bold').text('PROJECTS');
    drawLine(doc);
    content.projects.forEach((project) => {
      doc.fontSize(14).font('Helvetica-Bold').text(project.name || '');
      doc.fontSize(12).font('Helvetica').text(`Role: ${project.role || ''}`);
      doc.text(`Technologies: ${project.technologies || ''}`);
      project.achievements?.forEach((ach) => {
        doc.text(`• ${ach}`, { indent: 20 });
      });
      doc.moveDown(1);
    });
  } else if (content.awards?.length) {
    doc.fontSize(16).font('Helvetica-Bold').text('AWARDS & RECOGNITIONS');
    drawLine(doc);
    content.awards.forEach((award) => {
      doc.fontSize(14).font('Helvetica-Bold').text(award.title || '');
      doc.fontSize(12).font('Helvetica').text(`Date: ${award.date || ''}`);
      doc.text(award.description || '');
      doc.moveDown(1);
    });
  }

  // Certifications
  if (content.certifications?.length) {
    doc.fontSize(16).font('Helvetica-Bold').text('CERTIFICATIONS');
    drawLine(doc);
    content.certifications.forEach((cert) => {
      doc.fontSize(14).font('Helvetica-Bold').text(cert.name || '');
      doc.fontSize(12).font('Helvetica').text(`Issuer: ${cert.issuer || ''}`);
      const formatDate = (date) =>
        date === 'Present'
          ? 'Present'
          : new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      doc.text(`Issued: ${formatDate(cert.issueDate)}${cert.expiryDate ? ` | Expires: ${formatDate(cert.expiryDate)}` : ''}`);
      if (cert.credentialId) {
        doc.text(`Credential ID: ${cert.credentialId}`);
      }
      doc.moveDown(1);
    });
  }

  // Skills
  if (content.skills?.length) {
    doc.fontSize(16).font('Helvetica-Bold').text('SKILLS');
    drawLine(doc);
    drawSkills(doc, content.skills);
  }
};

export const getTemplates = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      templates: Object.keys(RESUME_TEMPLATES).map((key) => ({
        id: RESUME_TEMPLATES[key].id,
        name: RESUME_TEMPLATES[key].name,
        key,
        styles: RESUME_TEMPLATES[key].styles,
        structure: RESUME_TEMPLATES[key].structure,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

export const saveResume = async (req, res) => {
  try {
    const { userId, content, template } = req.body;
    if (!userId || !content || !template) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const validatedContent = typeof content === 'string'
      ? JSON.parse(content)
      : content;
    const [result] = await db.execute(
      'INSERT INTO resumes (user_id, content, template) VALUES (?, ?, ?)',
      [userId, JSON.stringify(validatedContent), template]
    );
    res.status(200).json({
      message: 'Resume saved successfully',
      resumeId: result.insertId,
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Failed to save resume' });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.userId;
    const [rows] = await db.execute(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    const content = typeof rows[0].content === 'string'
      ? JSON.parse(rows[0].content)
      : rows[0].content;
    // Attach the template key for PDF generation
    content.template = rows[0].template;
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.contentType("application/pdf");
      res.send(pdfData);
    });
    generatePDF(doc, content);
    doc.end();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
};

//Fetching resumes

export const getResumes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, template, created_at FROM resumes WHERE user_id = ?',
      [req.user.userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
};


export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM resumes WHERE id = ? AND user_id = ?', 
      [id, req.user.userId]);
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume' });
  }
};