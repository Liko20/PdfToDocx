document.addEventListener('DOMContentLoaded', function() {

    const count = document.getElementById('noofsen');
    const fileInput = document.getElementById('pdfFile');
    const messageDiv = document.getElementById('message');
    let fileName = '';

    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            fileName = file.name;
            console.log(`Selected file: ${fileName}`);
        } else {
            fileName = '';
        }
    });

    document.getElementById('uploadForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            messageDiv.textContent = 'Please select a PDF file.';
            return;
        }

        const formData = new FormData();
        formData.append('pdf', fileInput.files[0]);

        try {
            
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                messageDiv.textContent = 'File uploaded successfully!';
                const data = await response.json();
                
                count.innerHTML=`no_of_sentences=${data.analysis.num_sentences}  no_of_words=${data.analysis.num_words} no_of_characters=${data.analysis.num_characters} no_of_lines=${data.analysis.num_lines}`;
                console.log(`Uploaded file: ${fileName}`);

                // Replace both .pdf and .PDF with .docx using case-insensitive regex
                const docxFileName = fileName.toLowerCase().replace('.pdf', '.docx');
                //console.log(docxFileName)
                const downloadResponse = await fetch(`http://127.0.0.1:5000/download/${docxFileName}`, {
                    method: 'GET',
                });

                if (downloadResponse.ok) {
                    const blob = await downloadResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = docxFileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    messageDiv.textContent = 'Failed to download converted file.';
                }
            } else {
                messageDiv.textContent = 'Failed to upload file.';
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred: ' + error.message;
        }
    });
});
