import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { useMutation, useQuery } from "@apollo/client";
import { Redirect } from "react-router-dom";
import "../styles/sendingpdf.css";
import {
  ADD_FILE_TO_VENDIA,
  UPDATE_SENDER_INFO_ToSign,
  UPDATE_SENDER_INFO_,
} from "../Graphql/Mutations";

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET_NAME;
const REGION = process.env.REACT_APP_S3_BUCKET_REGION_NAME;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

export default function SendToBucketAndUser(props) {
  const [timeoutOccured, set] = useState(false);
  const [progress, setProgress] = useState(0);
  const loggedIn = window.localStorage.getItem("state");
  const [addVendia_File_async] = useMutation(ADD_FILE_TO_VENDIA);
  const [updateToSign, { data, loading }] = useMutation(
    UPDATE_SENDER_INFO_ToSign
  );
  const [update, { data: data2, loading: loading2 }] =
    useMutation(UPDATE_SENDER_INFO_);

  const uploadFile = (file) => {
    const params = {
      ACL: "public-read",
      Body: file,
      Bucket: S3_BUCKET,
      Key: file.name,
    };

    myBucket
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      })
      .send((err) => {
        if (err) console.log(err);
        else sendToVendia(file);
      });
  };

  const sendToVendia = (file) => {
    addVendia_File_async({
      variables: {
        sourceBucket: S3_BUCKET,
        sourceKey: file.name,
        sourceRegion: REGION,
        destinationKey: file.name,
      },
    });

    putInMyDocsSent(file);
    putInUserDocToSign(file);
  };

  const putInMyDocsSent = (file) => {
    const d = new Date();
    const date = d.toString();
    const newFile = {
      pdfName: file.name,
      usersSentTo: props.ids,
      timeSent: date,
    };
    props.prevFiles.push(newFile);
    update({
      variables: {
        id: loggedIn,
        documentsSentInfo: props.prevFiles,
      },
    });
    if (loading2) return <div> Loading...</div>;
  };

  const putInUserDocToSign = (file) => {
    const d = new Date();
    const date = d.toString();
    const newFile = {
      fromWho: loggedIn,
      pdfName: file.name,
      isSigned: false,
      nextToSend: props.ids.slice(1),
      timeOfSend: date,
    };
    props.prevToSign.push(newFile);
    updateToSign({
      variables: {
        id: props.ids[0],
        documentsToSignInfo: props.prevToSign,
      },
    });
    if (loading) return <div>Loading...</div>;
  };


  const callTimeout = () => {
    timer();
  }

  
  const timer = setTimeout(() => {
    set(true);
  }, 5000);

  return (
    <div>
      {progress === 0 ? (
        <button
          className="button-senduser"
          onClick={() => {
            uploadFile(props.file);
          }}
        >
          Send to User(s)
        </button>
      ) : null}
      {progress === 100 ? (
        <div>
          {callTimeout}
          {timeoutOccured ? <Redirect to="/" /> : (<div className="progress">Sent! Redirecting to the Dashboard...</div>)}
        </div>
      ) : null}
    </div>
  );
}
