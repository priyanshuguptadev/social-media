import { CLOUDINARY_URL } from '@env';
import sha1 from 'js-sha1';

// We map directly without the 'cloudinary' Node-SDK since react-native blocks fs/https modules.
export const uploadImage = async (imageUri) => {
    try {
        if (!CLOUDINARY_URL) {
            console.error('CLOUDINARY_URL is missing in .env');
            return null;
        }

        const match = CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        if (!match) {
            console.error('Invalid CLOUDINARY_URL format');
            return null;
        }

        const [, apiKey, apiSecret, cloudName] = match;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = 'social';

        // sha1 node equivalent bypass generating cloud signatures purely securely using js-sha1
        const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = sha1(strToSign);

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',   
            name: `upload_${timestamp}.jpg`
        });
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
            headers: {
               'Content-Type': 'multipart/form-data',
            }
        });

        const data = await res.json();
        
        if (data && data.secure_url) {
            return data.secure_url;
        } else {
            console.log('Upload error response:', data);
            return null;
        }
    } catch (error) {
        console.log('Error uploading to Cloudinary:', error);
        return null;
    }
}
