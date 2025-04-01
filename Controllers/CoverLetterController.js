import db from '../Config/Database.js';
import PDFDocument from 'pdfkit';

const generateLetterPDF = (doc, content) => {
  // Header
  doc.fontSize(12)
    .text(`${content.userInfo.name}\n${content.userInfo.address}\n${content.userInfo.email}\n${content.userInfo.phone}`, { align: 'right' });
  
  doc.moveDown(2);
  
  // Date and Recipient Info
  doc.text(content.date)
    .text(content.hiringManager)
    .text(content.company)
    .text(content.companyAddress);
  
  doc.moveDown(1);
  
  // Salutation
  doc.text(`Dear ${content.hiringManagerName || 'Hiring Manager'},`);
  
  doc.moveDown(1);
  
  // Body
  doc.fontSize(12)
    .text(content.body, { align: 'justify', paragraphGap: 5 });
  
  // Closing
  doc.moveDown(2)
    .text('Sincerely,')
    .moveDown(1)
    .text(content.userInfo.name);
};

export const saveCoverLetter = async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO cover_letters (user_id, content) VALUES (?, ?)',
      [userId, JSON.stringify(content)]
    );
    
    res.status(200).json({
      message: 'Cover letter saved successfully',
      letterId: result.insertId,
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Failed to save cover letter' });
  }
};

export const downloadCoverLetter = async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user.userId;
    
    const [rows] = await db.execute(
      'SELECT * FROM cover_letters WHERE id = ? AND user_id = ?',
      [letterId, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }
    
    const content = typeof rows[0].content === 'string' 
      ? JSON.parse(rows[0].content) 
      : rows[0].content;
    
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.contentType("application/pdf");
      res.send(pdfData);
    });
    
    generateLetterPDF(doc, content);
    doc.end();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download cover letter' });
  }
};

//fetchin coverletters 
export const getCoverLetters = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, created_at FROM cover_letters WHERE user_id = ?',
      [req.user.userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch cover letters' });
  }
};



export const deleteCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM cover_letters WHERE id = ? AND user_id = ?', 
      [id, req.user.userId]);
    res.status(200).json({ message: 'Cover letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete cover letter' });
  }
};