'use client';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Notify } from '../blockchain/pushprotocol';

const secretKey = 'secretKey';

library.add(faTimes);
library.add(faPlus);

function Invoice() {
  // const [logoImage, setLogoImage] = useState<string | ArrayBuffer | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientWalletAddress, setClientWalletAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [products, setProducts] = useState([{ productName: '', quantity: 0, rate: 0, amount: 0 }]);
  const [currency, setCurrency] = useState('');
  const [signer, setSigner] = useState(null);
  // const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);
  // const currencyButtonRef = useRef(null);

  const { address } = useAccount();
  // console.log(address, isConnected, status);
  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request access to the user's MetaMask account
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          // You can now access the signer
          const selectedAddress = accounts[0];
          const connectedSigner = provider.getSigner(selectedAddress);
          console.log('connectedSigner', connectedSigner);
          setSigner(connectedSigner);
        })
        .catch((err) => {
          console.error('Error connecting to MetaMask:', err);
        });
    } else {
      console.error('MetaMask is not installed');
    }
  }, []);

  const generatePaymentLink = () => {
    // Construct the payment link based on the invoice details
    const invoiceDetails = {
      billerAddress: address,
      clientWalletAddress: clientWalletAddress,
      totalAmount: getTotalAmount(),
      currency: currency,
    };

    // console.log(invoiceDetails);

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(invoiceDetails),
      secretKey,
    ).toString();

    // Convert the invoice details to a query string
    const queryParams = new URLSearchParams({ data: encryptedData }).toString();
    // console.log(queryParams);
    const paymentGatewayURL = `https://invoicified.vercel.app/Payment?${queryParams}`;
    // console.log(paymentGatewayURL);
    return paymentGatewayURL;
  };

  // const generatePDF = async () => {
  //   // Create a new jsPDF instance with landscape orientation
  //   const pdf = new jsPDF('l', 'pt', 'a4');

  //   // Generate payment link
  //   const paymentLink = generatePaymentLink();

  //   // Convert the component to HTML
  //   const invoiceHTML = document.getElementById('report');

  //   // Render the HTML to a canvas with higher DPI
  //   const dpi = 300; // Adjust DPI as needed for your desired quality
  //   const scale = dpi / 96; // The default DPI is 96, so calculate the scale factor
  //   const canvas = await html2canvas(invoiceHTML, { scale: scale });

  //   // Convert the canvas to an image
  //   const imgData = canvas.toDataURL('image/jpeg', 1.0);

  //   // Add the image to the PDF
  //   pdf.addImage(imgData, 'JPEG', 0, 0, 842, 595); // Use landscape A4 paper dimensions

  //   // Position the "Click to Pay" button at the bottom right corner with margin
  //   const text = 'Pay Now!';
  //   const textWidth = pdf.getStringUnitWidth(text) * 16; // Adjust the font size as needed
  //   const rightX = pdf.internal.pageSize.width - 20 - textWidth; // Adjust the horizontal position to place it at the right with margin
  //   const bottomY = pdf.internal.pageSize.height - 70; // Adjust the vertical position to place it at the bottom with margin

  //   // Add a rectangle as a background for the button
  //   pdf.setFillColor(51, 122, 183); // MUI primary color as background color
  //   pdf.rect(rightX - 5, bottomY - 5, textWidth + 10, 30, 'F'); // 'F' indicates to fill the rectangle

  //   // Set the text color to white for better visibility
  //   pdf.setTextColor(255, 255, 255);

  //   // Add the payment link as a clickable button
  //   pdf.text(text, rightX, bottomY + 20).setFontSize(16);

  //   pdf.link(rightX - 5, bottomY - 5, textWidth + 10, 30, { url: paymentLink });

  //   // Save the PDF or open it in a new tab
  //   pdf.save('invoice.pdf');
  // };

  const generatePDF = async () => {
    // Create a new jsPDF instance with landscape orientation and larger height
    const pdf = new jsPDF('l', 'pt', [842, 800]); // Use landscape A4 paper dimensions with increased height

    // Generate payment link
    const paymentLink = generatePaymentLink();

    // Convert the component to HTML
    const invoiceHTML = document.getElementById('report');

    // Render the HTML to a canvas with higher DPI for better quality
    const dpi = 600; // Adjust DPI as needed for improved quality
    const scale = dpi / 96; // The default DPI is 96, so calculate the scale factor
    let canvas;
    if (invoiceHTML != null) {
      canvas = await html2canvas(invoiceHTML, { scale: scale });
    }

    // Convert the canvas to an image
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Add the image to the PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, 842, 800); // Use landscape A4 paper dimensions with increased height

    // Position the "Pay Now" button at the bottom right corner with margin
    const text = 'Pay Now';
    const textWidth = pdf.getStringUnitWidth(text) * 16; // Adjust the font size as needed
    const rightX = pdf.internal.pageSize.width - 20 - textWidth; // Adjust the horizontal position to place it at the right with margin
    const bottomY = pdf.internal.pageSize.height - 70; // Adjust the vertical position to place it at the bottom with margin

    // Add a rectangle as a background for the button
    pdf.setFillColor(39, 76, 119); // Background color: #A3CEF1
    pdf.rect(rightX, bottomY - 5, textWidth + 10, 40, 'F'); // 'F' indicates to fill the rectangle

    // Set the text color to white for better visibility
    pdf.setTextColor(255, 255, 255);

    // Add the payment link as a clickable button
    pdf.text(text, rightX + 5, bottomY + 20).setFontSize(16);

    pdf.link(rightX - 5, bottomY - 5, textWidth + 10, 30, { url: paymentLink });

    // Save the PDF or open it in a new tab
    pdf.save('invoice.pdf');
    const sendNoti = await Notify(
      clientWalletAddress,
      `Invoice Received form ${companyName}!`,
      paymentLink,
    );
    console.log('sent', sendNoti);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    // Calculate the amount when rate or quantity changes
    if (field === 'rate' || field === 'quantity') {
      updatedProducts[index].amount = updatedProducts[index].rate * updatedProducts[index].quantity;
    }

    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { productName: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const deleteProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const getTotalAmount = () => {
    return products.reduce((total, product) => total + product.amount, 0);
  };

  // Function to handle logo file input
  // const handleLogoInputChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (e.target != null) {
  //         setLogoImage(e.target.result);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const changeCurrency = (newCurrency) => {
  //   setCurrency(newCurrency);
  // };

  const currencyOptions = ['Sepolia', 'Goerli'];

  // const toggleCurrencyOptions = () => {
  //   setShowCurrencyOptions(!showCurrencyOptions);
  // };

  // useEffect(() => {
  //   // const handleOutsideClick = (event: any) => {
  //   //   if (currencyButtonRef.current) {
  //   //     if (currencyButtonRef.current) {
  //   //       setShowCurrencyOptions(false);
  //   //     }
  //   //   }
  //   // };

  //   window.addEventListener('mousedown', handleOutsideClick);

  //   return () => {
  //     window.removeEventListener('mousedown', handleOutsideClick);
  //   };
  // }, []);

  return (
    <>
      {false && (
        <div className="min-h-screen bg-gradient-to-b from-[#A3CEF1] to-white flex flex-col justify-center items-center p-8 pt-28">
          <select
            onChange={(e) => setCurrency(e.target.value)}
            value={currency}
            className="border bg-white rounded-full text-center items-center p-2 w-32 h-10 font-bold mb-8 ml-auto mr-80"
          >
            <option value="">Select Chain</option>
            {currencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="bg-white rounded-lg shadow-md py-16 space-y-4" id="report">
            <div className="flex justify-between px-16">
              <div className="flex flex-col space-y-4">
                {/* <label
              htmlFor="logoInput"
              className="border rounded flex items-center justify-center p-2 h-20 w-36 cursor-pointer text-center"
            >
              {logoImage ? (
                <img src={logoImage} alt="Logo" className="object-contain" />
              ) : (
                <div className="font-frank text-gray-400">Add your logo</div>
              )}
            </label>
            <input
              type="file"
              id="logoInput"
              accept="image/*"
              className="hidden"
              onChange={handleLogoInputChange}
            /> */}
                <input
                  type="text"
                  placeholder="Enter company's name"
                  className="border rounded p-2 w-48"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="font-bold text-4xl font-frank">INVOICE</div>
            </div>
            <div className="border-t border-gray-300 w-full mt-4"></div>
            <div className="grid grid-cols-2 gap-4 px-16 py-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="mr-2">Bill To:</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 w-32">Client&apos; Name:</span>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 w-32">Wallet Address:</span>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={clientWalletAddress}
                    onChange={(e) => setClientWalletAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 pl-16">
                <div className="flex items-center">
                  <span className="mr-2 w-32">Invoice Number:</span>
                  <input
                    type="number"
                    className="border rounded p-2"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 w-32">Invoice Date:</span>
                  <input
                    type="date"
                    className="border rounded p-2"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 w-32">Due date:</span>
                  <input
                    type="date"
                    className="border rounded p-2"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-y py-2 border-gray-300 w-full grid grid-cols-12 px-16">
              <div className="col-span-5">Product(s)</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>
            {products.map((product, index) => (
              <div className="grid grid-cols-12 px-16" key={index}>
                <div className="col-span-5 space-y-2">
                  <input
                    type="text"
                    placeholder="Product Name"
                    className="border rounded p-2"
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-16"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductChange(index, 'quantity', parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-16"
                    value={product.rate}
                    onChange={(e) => handleProductChange(index, 'rate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-2 space-y-2 mt-2">
                  {product.amount} {currency || ''}
                </div>
                <div className="col-span-1 space-y-2 flex items-center">
                  <button
                    onClick={() => deleteProduct(index)}
                    className="w-8 h-8 border rounded-full flex items-center justify-center bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white"
                  >
                    <FontAwesomeIcon icon="times" />
                  </button>
                </div>
              </div>
            ))}
            <div className="px-16 border-b pb-4">
              <button className="bg-gray-200 py-2 px-4 border rounded-md" onClick={addProduct}>
                <FontAwesomeIcon icon="plus" className="mr-2" />
                Add
              </button>
            </div>

            <div className="grid grid-cols-12 px-16">
              <div className="col-span-5"></div>
              <div className="col-span-2"></div>
              <div className="col-span-2 font-bold">Total</div>
              <div className="col-span-2">
                {getTotalAmount()} {currency || ''}
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="rounded-full bg-[#A3CEF1] text-black font-bold font-frank py-4 mt-4 px-6 hover:bg-[#389BA0]"
              onClick={generatePDF}
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {true && (
        <>
          <section className="max-container flex justify-center flex-wrap gap-9">
            <div className="min-h-screen flex flex-row justify-center items-center p-8 pt-28 gap-8 ">
              <div className="flex-1 justify-center align-center sm:w-[350px] sm:min-w-[350px] w-full rounded-[20px] shadow-3xl px-10 py-8">
                {/* <div className="w-11 h-11 justify-center items-center bg-coral-red rounded-full"> */}

                <div className="p-3  mt-2 text-center space-x-4 md:block">
                  <div className="self-center">
                    <Image
                      src="https://bafkreihmcogy7n4xdetmdzshw6nfrvrop3ugpafvqmk4urgyg7vypxo3ai.ipfs.nftstorage.link/"
                      alt=""
                      width={240}
                      height={240}
                    />
                  </div>

                  <h3 className="mt-5 font-palanquin text-3xl leading-normal font-bold">
                    50 INVOICES PER MONTH
                  </h3>
                  <button
                    // onClick={() => setOne(true)}
                    className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                  >
                    <div className="flex max-sm:justify-end items-center max-sm:w-full">
                      <button
                        // onClick={() => setOne(true)}
                        className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                      >
                        <div className="flex max-sm:justify-end items-center max-sm:w-full">
                          <button
                            className={`flex justify-center items-center gap-2 px-7 py-4 border font-montserrat text-lg leading-none rounded-full
                                      bg-coral-red text-white  w-full`}
                          >
                            BUY
                            {/* {iconUrl && (
                          <img src={iconUrl} alt="Icon" className="ml-2 rounded-full w-5 h-5" />
                        )} */}
                          </button>
                        </div>
                      </button>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex-1 justify-center align-center sm:w-[350px] sm:min-w-[350px] w-full rounded-[20px] shadow-3xl px-10 py-8">
                {/* <div className="w-11 h-11 justify-center items-center bg-coral-red rounded-full"> */}

                <div className="p-3  mt-2 text-center space-x-4 md:block">
                  <div className="self-center">
                    <Image
                      src="https://bafybeigrdc5etrjqie6pbfoaqbqy7nctqllpy6uqkpofpp53leyv3pokzq.ipfs.nftstorage.link/"
                      alt=""
                      width={240}
                      height={240}
                    />
                  </div>

                  <h3 className="mt-5 font-palanquin text-3xl leading-normal font-bold">
                    20 INVOICES PER MONTH
                  </h3>
                  <button
                    // onClick={() => setOne(true)}
                    className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                  >
                    <div className="flex max-sm:justify-end items-center max-sm:w-full">
                      <button
                        // onClick={() => setOne(true)}
                        className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                      >
                        <div className="flex max-sm:justify-end items-center max-sm:w-full">
                          <button
                            className={`flex justify-center items-center gap-2 px-7 py-4 border font-montserrat text-lg leading-none rounded-full
                                      bg-coral-red text-white  w-full`}
                          >
                            BUY
                            {/* {iconUrl && (
                          <img src={iconUrl} alt="Icon" className="ml-2 rounded-full w-5 h-5" />
                        )} */}
                          </button>
                        </div>
                      </button>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex-1 justify-center align-center sm:w-[350px] sm:min-w-[350px] w-full rounded-[20px] shadow-3xl px-10 py-8">
                {/* <div className="w-11 h-11 justify-center items-center bg-coral-red rounded-full"> */}

                <div className="p-3  mt-2 text-center space-x-4 md:block">
                  <div className="self-center">
                    <Image
                      src="https://bafybeicuxep4ytv3s5kuir5aoohfdk3wgxxj3b5rvou35fojxdtlsv4viu.ipfs.nftstorage.link/"
                      alt=""
                      width={240}
                      height={240}
                    />
                  </div>

                  <h3 className="mt-5 font-palanquin text-3xl leading-normal font-bold">
                    10 INVOICES PER MONTH
                  </h3>
                  <button
                    // onClick={() => setOne(true)}
                    className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                  >
                    <div className="flex max-sm:justify-end items-center max-sm:w-full">
                      <button
                        // onClick={() => setOne(true)}
                        className="mt-8 mb-2 md:mb-0 px-5 py-2 text-sm"
                      >
                        <div className="flex max-sm:justify-end items-center max-sm:w-full">
                          <button
                            className={`flex justify-center items-center gap-2 px-7 py-4 border font-montserrat text-lg leading-none rounded-full
                                      bg-coral-red text-white  w-full`}
                          >
                            BUY
                            {/* {iconUrl && (
                          <img src={iconUrl} alt="Icon" className="ml-2 rounded-full w-5 h-5" />
                        )} */}
                          </button>
                        </div>
                      </button>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default Invoice;
