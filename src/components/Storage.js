import { Amplify } from 'aws-amplify';
import { uploadData, getUrl } from '@aws-amplify/storage';
import awsExports from '../aws-exports';
import { toast } from 'react-toastify';

Amplify.configure(awsExports);

export async function uploadAudio(audioUrl) {
  try {
    const response = await fetch(audioUrl);
    const audioBlob = await response.blob();
    const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

    const uniqueKey = `recording-${Date.now()}.wav`;


    const result = await uploadData({
      key: uniqueKey,
      data: file,
      options: {
        contentType: 'audio/wav',
        accessLevel: 'public',
      },
    });

    console.log('File uploaded successfully:', result);

    const fileUrl = await getUrl({ key: uniqueKey, options: { accessLevel: 'public' } });
    console.log('Uploaded File URL:', fileUrl.url);

    toast.success('Audio uploaded successfully!');

  } catch (error) {
    console.error('Upload failed', error);
    
    toast.error('Upload failed. Check the console for details.');
  }
}

