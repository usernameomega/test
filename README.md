# Identity Service

Hashgraph Labs Identity Service

This is the Identity Service for Hashgraph Labs. It implements the W3C DID and DIF Resolution and Management specification for the `did:hedera` method to provide standards-compliant production of DIDs and DID Documents ("DIDDoc").

## Table of Contents

- [Installation](#installation)
- [Set Up Your Environment Variables](#env)
- [Start the application](#start)
- [License](#license)
- [Contact](#contact)

## Installation

Before you can start using the application, you need to make sure you have [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed on your machine. To check if you have Node.js installed, run the command `node -v` in your terminal. Similarly, you can run `npm -v` to confirm you have npm installed. If you don't, please follow the instructions on their respective websites to install them.

### Clone the repository

Next, you'll need to clone the repository to your local machine:

```sh
git clone https://github.com/Swiss-Digital-Assets-Institute/identity-service.git
```


### Navigate to the project directory

```sh
cd your-repo-name
```

### Install dependencies

This project uses npm to manage its dependencies. So, before you can start using it, you need to install these dependencies by running:

```sh
npm install
```

<a id="env"></a>
## Set Up Your Environment Variables

In order to run the application correctly, you must configure your environment variables. These can be found in the `.env` file located at the root of the project. 

Create an `.env` file at the root of your project and set the variables as follows:


|Variable|Description|Required|
|---|---------|---|
|HEDERA_TEST_IDENTIFIERS|A string of example DID identifiers for the HEDERA DID method, separated by commas.|No|
|HEDERA_DID_RESOLVER_URI|A URL for HEDERA DID method resolver.|Yes|
|RELAYER_ACCOUNT_ID|A HEDERA account private key in DER format used to interact with chain.|Yes|
|RELAYER_PRIVATE_KEY|A HEDERA account ID.|Yes|


Be sure to replace each of the placeholders with the actual values from your Hedera Hashgraph account setup.
Note: Always ensure sensitive information, such as your private keys, are kept confidential and not included in your version control system.

<a id="start"></a>
## Start the application

```sh
npm start
```

You should see the output indicating that the Identity Service is running and listening on a port 3000.
You can confirm that everything is running by executing below command on your terminal:

```sh
curl --location 'localhost:3000/universal-resolver/methods' \
--header 'Accept: application/did+json'
```

as a result you should be able to see the methods supported by the Identity Service:

```json
[
  "hedera"
]
```

## License

This project is licensed under the AAA License - see the [LICENSE](LICENSE) file for details.

## Contact

If you notice anything not behaving how you expected, or would like to make a suggestion / request for a new feature, please create a new issue and let us know.

Email: [identity@hashgraph-group.com](mailto:identity@hashgraph-group.com)

Project Link: [https://github.com/Swiss-Digital-Assets-Institute/identity-service](https://github.com/Swiss-Digital-Assets-Institute/identity-service)

