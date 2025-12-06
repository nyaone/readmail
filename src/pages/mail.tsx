import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { ParsedMail } from "mailparser";
import Head from "next/head";

import Header from "@/partial/header";
import Body from "@/partial/body";
import Footer from "@/partial/footer";

const EmailPage = () => {
  const router = useRouter();
  const { url } = router.query;

  const [isLoading, setLoading] = useState(true);
  const [mail, setMail] = useState<ParsedMail | null>(null);
  const [err, setError] = useState<string | null>(null);

  const loadMail = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(`/api/parse?url=${url}`).then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            return res.text().then((message) => {
              throw new Error(message);
            });
          }
        });
        setError(null);
        setMail(response);
      } catch (e: any) {
        setError(e.message);
      }

      setLoading(false);
    },
    [setMail, setError, setLoading],
  );

  useEffect(() => {
    setLoading(true);
    if (typeof url !== "string") {
      setError("Request URL is invalid");
      setLoading(false);
      return;
    }

    // Load mail
    loadMail(url);
  }, [url]);

  return (
    <>
      <Head>
        <title>{isLoading ? "加载中..." : mail?.subject || "(无主题)"}</title>
        <meta name="description" content="Online email reader" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        {isLoading ? (
          <div>加载中...</div>
        ) : !!err || !mail ? (
          <div>{err}</div>
        ) : (
          <div className="max-w-2xl p-4 m-auto bg-white divide-y">
            {/*Show Mail*/}
            <Header
              subject={mail.subject || "(no subject)"}
              time={mail.date && new Date(mail.date)}
              senders={mail.from?.value || []}
              // receivers={mail.to?.value || []}
            />
            <Body html={mail.html || mail.text || "(no body)"} />
            <Footer attachments={mail.attachments} />
          </div>
        )}
      </main>
    </>
  );
};

export default EmailPage;
