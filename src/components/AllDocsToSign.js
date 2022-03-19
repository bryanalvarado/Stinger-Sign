import React from "react";
import { useQuery } from "@apollo/client";
import { GET_SENT_INFO_DOCS_TO_SIGN } from "../Graphql/Query";
import ShowAllDocsToSign from "./ShowAllDocsToSign";

export default function AllDocsToSign() {
  const loggedIn = window.localStorage.getItem("state");
  const { data, error, loading, refetch } = useQuery(
    GET_SENT_INFO_DOCS_TO_SIGN,
    {
      variables: {
        id: loggedIn,
      },
    }
  );

  if (loading) (<div>Loading...</div>);
  if (error) (<div>Error</div>);

  return (
    <div className="Sig-Req-Page">
      <h1 className="sig-req">Signatures Required</h1>
      {data.get_UserInfo.documentsToSign.documentsToSignInfo.length !== 0 ? (
        data.get_UserInfo.documentsToSign.documentsToSignInfo.map((document) => {
            if (!document.isSigned) return (<ShowAllDocsToSign senderID={document.fromWho} pdfName={document.pdfName}/>)
          }
        )
      ) : (
        <p className="noDocsToSign"> No Documents To Sign...Sadly </p>
      )}
    </div>
  );
}