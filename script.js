async function uploadFile(){

const file =
document.getElementById("file").files[0];

if(!file){
alert("Dosya seçiniz");
return;
}

const formData = new FormData();

formData.append("file", file);

formData.append(
"upload_preset",
"wedding_upload"
);

const response =
await fetch(
"https://api.cloudinary.com/v1_1/CLOUD_NAME/auto/upload",
{
method:"POST",
body:formData
}
);

const data =
await response.json();

document.getElementById("result")
.innerHTML =
"❤️ Teşekkürler!";
}
