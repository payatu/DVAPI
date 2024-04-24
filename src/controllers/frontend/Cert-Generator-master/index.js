const userName = document.getElementById("name");
const submitBtn = document.getElementById("submitBtn");

const { PDFDocument, rgb, degrees } = PDFLib;


const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase()
  );

submitBtn.addEventListener("click", () => {
  const val = capitalize(userName.value);

  //check if the text is empty or not
  if (val.trim() !== "" && userName.checkValidity()) {
    // console.log(val);
    generatePDF(val);
  } else {
    userName.reportValidity();
  }
});

// const generatePDF = async (name) => {
//   const existingPdfBytes = await fetch("http://localhost:3001/cert").then((res) =>
//     res.arrayBuffer()
//   );

//   // Load a PDFDocument from the existing PDF bytes
//   const pdfDoc = await PDFDocument.load(existingPdfBytes);
//   pdfDoc.registerFontkit(fontkit);

//   //get font
//   const fontBytes = await fetch("./Sanchez-Regular.ttf").then((res) =>
//     res.arrayBuffer()
//   );

//   // Embed our custom font in the document
//   const SanChezFont = await pdfDoc.embedFont(fontBytes);
//   console.log(SanChezFont)
//   // Get the first page of the document
//   const pages = pdfDoc.getPages();
//   const firstPage = pages[0];

//   // const textWidth = SanChezFont.widthOfText(name, 58);
//   const nameWidth = SanChezFont.widthOfTextAtSize(name, 58);
//   const centerX = firstPage.getWidth() / 2;
//   const nameX = centerX - nameWidth / 2;
  
//   firstPage.drawText(name, {
//     x: nameX,
//     y: 260,
//     size: 58,
//     font: SanChezFont,
//     color: rgb(0.94, 0.97, 1.0),
//   });


//   // Serialize the PDFDocument to bytes (a Uint8Array)
//   const pdfBytes = await pdfDoc.save();
//   console.log("Done creating");


//   var file = new File(
//     [pdfBytes],
//     "DVAPI_Certificate.pdf",
//     {
//       type: "application/pdf;charset=utf-8",
//     }
//   );
//  saveAs(file);
// };

// init();
