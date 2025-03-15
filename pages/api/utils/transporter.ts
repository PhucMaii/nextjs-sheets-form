import nodemailer from 'nodemailer';
import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch, { Headers } from 'node-fetch';

const email = process.env.NODEMAILER_EMAIL;
const pass = process.env.NODEMAILER_PASSWORD;

export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass,
  },
});

// export const yahooTransporter = nodemailer.createTransport({
//   service: 'yahoo',
//   auth: {
//     user: email,
//     pass,
//   },
// });

const yahooEmail = process.env.YAHOO_EMAIL;

export const yahooTransporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service: 'yahoo',
  secure: false,
  auth: {
    user: yahooEmail,
    pass: 'maithienphuc0102',
  },
});

const clientSecret = process.env.OUTLOOK_SECRET_VALUE;
const clientId = process.env.OUTLOOK_CLIENT_ID;
const tenantId = process.env.OUTLOOK_TENANT_ID;
const aadEndpoint = 'https://login.microsoftonline.com';
const graphEndpoint = 'https://graph.microsoft.com';

// const msalConfig = {
//   auth: {
//     clientId,
//     clientSecret,
//     authority: `${aadEndpoint}/${tenantId}`,
//   },
// };

export async function sendOutlookEmail(to, subject, body) {
  try {
    const msalConfig: any = {
      auth: {
        clientId,
        clientSecret,
        authority: `${aadEndpoint}/${tenantId}`,
      },
    };

    const tokenRequest = {
      scopes: [`${graphEndpoint}/.default`],
    };

    console.log(tokenRequest);

    const cca = new ConfidentialClientApplication(msalConfig);
    const tokenInfo = await cca.acquireTokenByClientCredential(tokenRequest);
    console.log(tokenInfo, 'tokenInfo');

    if (!tokenInfo?.accessToken) {
      throw new Error('Failed to acquire access token');
    }

    const mail = {
      subject,
      toRecipients: [{ emailAddress: { address: to } }],
      from: { emailAddress: { address: 'maithienphuc0102@outlook.com' } },
      body: {
        content: body,
        contentType: 'HTML',
      },
      saveToSentItems: true,
    };

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${tokenInfo?.accessToken}`);
    headers.append('Content-Type', 'application/json');

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(mail),
    };

    const response = await fetch(
      `${graphEndpoint}/v1.0/users/maithienphuc0102@outlook.com/sendMail`,
      options,
    );

    console.log(response, 'response');

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export const hotmailTransporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 995,
  secure: false,
  auth: {
    type: 'OAuth2',
    user: 'PhucMai@supremesprouts.onmicrosoft.com',
    clientId: clientId,
    clientSecret: clientSecret,
    refreshToken:
      '1.AWEB7CkT3ofypk2MKqVKunWESMoBHLBLUB9LuJgAs8SgoKzKARBhAQ.AgABAwEAAABVrSpeuWamRam2jAF1XRQEAwDs_wUA9P82kSr2oazRzDmN4SGmvBugdLN4BJQQZOaPcs32ou9zYrickuCLCkzj9X3BUhpcjBNmeeNwjaBRAxyWZUyRbEGwvBUv_e0lrlGpfpOLKEExP-iLtMswManOw-o2YNreTBy4s7stWZD6Q9CzhoQ4fwqsocy7U9ysNcT1EsqbT0PmJ264T816Y0sHp4nSmh9Gqz-X7yTVD907NxCb1znscYDhhrhES58j2-9jXv7weX6_IINkV1xFEBkgwJdcRaIV5ZrN27J0jiXmZweL7CBQAzrbIZdfLUz_n6MQ1aS0NizdVPhlGhfGUh0P5TwiJnEhGVQWrtRQWhWS1lG9LdixSOnOKikdiVbIzBFWpsrBvFikeMx8kNvLhMoct5EUjeDdeoAiqm_3_7X92LNTMfjvzQ5KSna40vK6pyitFD3X0jHjahvImmfNlNWEPbZ5fhRlscOFZ1uGxkEb3i0SyXb27RUGZO8_jzBTYm93dF2U5whVoUdOYaMnjPWfDQLix74fmWcFjin2ZSUQFX2ZnlgSaKhW5jejLUzT6R-I64uZx7vyYBDotGeyZaVyd8kMpGbC1J6wU46bv9ssttrgcJGJqRYjEnLrxPDOXqbf415SSzlOHxuIBthFnUxtE_KUQMvZsDYPsprIiK4teKBJtC-t3Oo0k_99NoaEONeuG646Ko7EYoUuDMS5ZwUIq8AsCc8afJ9-dbJG7GI6zqdm_VNYV4nlD0MjNBhb_KCR3A2TocygguSGh9etRXi0PNLeO7M6PnzjJDoBwTMvEDTogjZTMki47kwF1yGJT91fwbY4F6-mUCXP2ndn',
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJub25jZSI6IklLYXYxUW45TFZpLW4yOVFzb3FPRWZHc20wR1RHazE5a0FXejRTMFNrY3ciLCJhbGciOiJSUzI1NiIsIng1dCI6IkpETmFfNGk0cjdGZ2lnTDNzSElsSTN4Vi1JVSIsImtpZCI6IkpETmFfNGk0cjdGZ2lnTDNzSElsSTN4Vi1JVSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kZTEzMjllYy1mMjg3LTRkYTYtOGMyYS1hNTRhYmE3NTg0NDgvIiwiaWF0IjoxNzQyMjI4Nzc4LCJuYmYiOjE3NDIyMjg3NzgsImV4cCI6MTc0MjIzMzk2MCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVdRQW0vOFpBQUFBSms1ejFwZkw1bExvc2hkS1EyVEZIQ0x3MStCTmhyU3VHd1BYWUpxa3IrMzd6WnNndCtJRjgwa2FFWXc5Z0RmcTdYVUU4UThGT214UHp6WERpbWdDVkVXZ0gvN2dSLzEwMFczUlZ5eHJOTUhVQWEzd0w4OFNvbGU1V0hBeFZoci8iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IlN1cHJlbWUgU3Byb3V0cyIsImFwcGlkIjoiYjAxYzAxY2EtNTA0Yi00YjFmLWI4OTgtMDBiM2M0YTBhMGFjIiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJNYWkiLCJnaXZlbl9uYW1lIjoiUGh1YyIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE3Mi4xMDMuMjQ0LjQzIiwibmFtZSI6IlBodWMgTWFpIiwib2lkIjoiMGMwMDVhY2MtNjllOC00YTk4LTgzMTgtNTMzZmM4YjcyMTNjIiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMyMDA0NkFBMkU5RDAiLCJyaCI6IjEuQVdFQjdDa1Qzb2Z5cGsyTUtxVkt1bldFU0FNQUFBQUFBQUFBd0FBQUFBQUFBQURLQVJCaEFRLiIsInNjcCI6IlNNVFAuU2VuZCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwMzA2NmI5LTEyMDAtMDg0ZC03NjI4LWVjNDdjZTkyM2UxMiIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IkgxWGt3TkotbE9TaXVVaFF1a1lOeE5oUnhXS2lnTkcxanc5MnJHeW5JR0kiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJkZTEzMjllYy1mMjg3LTRkYTYtOGMyYS1hNTRhYmE3NTg0NDgiLCJ1bmlxdWVfbmFtZSI6IlBodWNNYWlAc3VwcmVtZXNwcm91dHMub25taWNyb3NvZnQuY29tIiwidXBuIjoiUGh1Y01haUBzdXByZW1lc3Byb3V0cy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJ5SW1LNmIzQXpFYXlWVWRJZlJrVEFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyI2MmU5MDM5NC02OWY1LTQyMzctOTE5MC0wMTIxNzcxNDVlMTAiLCJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2Z0ZCI6IllIaWlJVVNkYlNMaERKdkk3ZmlMUXZOeDZUdHdwdEtWSk5PODZBZUV1eDAiLCJ4bXNfaWRyZWwiOiIxIDEyIiwieG1zX3N0Ijp7InN1YiI6IlJXZ2wwT041RXVBdVBVeUNJekwwNU9GM2hNSTR3blljTjdVWlIxdEFmM1kifSwieG1zX3RjZHQiOjE3NDIyMjgxMzd9.FHUilL6WF_HscgPoAQe2WUhuXWZDjNx_sA2BC627_b9FYXkJHIQNi5-ElHJfbimaA8JNXtIbNk-yj8-VpZozcfDR5hi9gp434VVxx3R-9RizQPerF8l-WgxnfB3t50KGe5CgAn8fvVut180weWYjexhWd2Lqw2GDFmJBt3WL81TO3OG4N3L_4Pz18mLB7Z7dExPa5oiSMEYEls05x2i52i4XcSDxvpeSy2i6VyvkpZ-LQzT_-i3XSwgW9xR8BqSfh0BjOEtUn1KiNLhMBGeVbetZmx_miSzYA2J7JYamwlWf-pMG_NVaJ-eMbzBZ2ir21jsD-pPodKZOzlaIZAKZ9w',
  },
});
