import { ipfsImg, uploadAvatar } from "../request/api/public";
import { message, Upload } from "antd";

export const UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    onStart(file) {
      console.log('onStart ==>', file);
    },
    async customRequest({
      data,
      file,
      filename,
      onError,
      onSuccess
    }) {
      // const isLt100M = file.size / 1024 / 1024 < 20;
      // if (!isLt100M) {
      //   return
      // }
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      formData.append('file', file);

      try {
        const res = await ipfsImg(formData);
        if (res.status !== 0) {
          // const error = new Error(err.message);
          message.error(res.message);
          onError({event: res.message});
        }else{
          onSuccess();
        }
      } catch (err) {
        console.log("err ===>", err);
      }

      return {
        abort() {
          console.log("upload progress is aborted.");
        }
      };
    },

    // customRequest({ file, onError }){
    //   // 模拟上传失败
    //   setTimeout(() => {
    //     const error = new Error('Some error');
    //     onError({event:error});
    //     message.error('上传失败');
    //   }, 1000);
    // },
    beforeUpload(file) {
      const formatArr = ["image/jpeg","image/png","image/svg+xml","image/gif","image/webp"]
      let isImage = false
      formatArr.map((e)=>{
        if ( file.type === e ) {
          isImage = true
        }
      })
      if (!isImage) {
        message.error("You can only upload JPG/PNG file!");
        return false || Upload.LIST_IGNORE
      }
      const isLt100M = file.size / 1024 / 1024 < 20;
      if (!isLt100M) {
        message.error("Image must smaller than 20MB!");
        return false || Upload.LIST_IGNORE
      }
    }
};

export const UploadAvatarProps = {
  name: "file",
  multiple: false,
  maxCount: 1,
  onStart(file) {
    console.log('onStart ==>', file);
  },
  onError(err) {
    console.log("onError ==>", err);
  },
  customRequest({
    data,
    file,
    filename,
    onError,
    onSuccess
  }) {
    const formData = new FormData();
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }
    formData.append('file', file);
    uploadAvatar(formData)
    .then(res => {
      console.log('success ==>',res , file);
      onSuccess(res, file);
    })
    .catch(err => {
      console.log(err);
    });

    return {
      abort() {
        console.log("upload progress is aborted.");
      }
    };
  },
  beforeUpload(file) {
    const formatArr = ["image/jpeg","image/png","image/svg+xml","image/gif","image/webp"]
    let isImage = false
    formatArr.map((e)=>{
      if ( file.type === e ) {
        isImage = true
      }
    })
    if (!isImage) {
      message.error("You can only upload JPG/PNG file!");
      return false
    }
    const isLt4M = file.size / 1024 / 1024 < 4;
    if (!isLt4M) {
      message.error("Image must smaller than 4MB!");
    }
  }
};