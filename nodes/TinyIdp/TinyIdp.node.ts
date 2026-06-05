import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeApiError,
	NodeOperationError,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';

export class TinyIdp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tiny IDP',
		name: 'tinyIdp',
		icon: 'file:tidp-logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["documentType"]}}',
		description: 'Extract data from identity documents using Tiny IDP',
		usableAsTool: true,
		defaults: {
			name: 'Tiny IDP',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'tinyIdpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Document Type',
				name: 'documentType',
				type: 'options',
				options: [
					{
						name: 'European Driver License',
						value: 'european-driver-license',
						description: 'Extract licensee categories, permit numbers, restriction codes, and personal data from standardized EU-compliant driver licenses',
					},
					{
						name: 'French Vehicle Certificate (Carte Grise)',
						value: 'carte-grise',
						description: 'Extract comprehensive technical specifications, engine codes, classifications, and owner details from France’s Certificat d’Immatriculation',
					},
					{
						name: 'International ID Card',
						value: 'generic-id-document',
						description: 'Extract identity details, document numbers, expiry dates, and personal details from national ID cards worldwide',
					},
					{
						name: 'International Passport',
						value: 'passport',
						description: 'High-precision OCR extraction for all international, ICAO-compliant passports with automatic TD3 MRZ verification',
					},
					{
						name: 'Proof of Address',
						value: 'proof-of-address',
						description: 'Read and structure precise address details, utility providers, and names from bank statements, utility bills, and official letters',
					},
					{
						name: 'Spanish Corporate Tax ID (CIF)',
						value: 'es-cif',
						description: 'Verify Spanish business registration details, CIF numbers, corporate names, and official company address information for secure KYB flows',
					},
					{
						name: 'Spanish National ID Card (DNI)',
						value: 'es-national-id-card',
						description: 'Full data extraction for Spain’s Documento Nacional de Identidad. Extracts personal data, support numbers, and structures the home address.',
					},
					{
						name: 'Spanish Vehicle Registration',
						value: 'es-vehicle-registration-certificate',
						description: 'Extract license plate, registration dates, vehicle owner details, VIN, brand, and type from Spain’s Permiso de Circulación',
					},
					{
						name: 'Spanish Vehicle Technical Sheet',
						value: 'es-vehicle-technical-sheet',
						description: 'Extract intricate vehicle specifications, CO2 emissions, masses, dimensions, and inspection logs from Spain’s Ficha Técnica (ITV)',
					},
				],
				default: 'passport',
				description: 'The type of identity document to extract data from',
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'File (Binary)',
						value: 'file',
					},
					{
						name: 'Public URL',
						value: 'url',
					},
				],
				default: 'url',
				description: 'Whether to provide a public URL or upload a binary file',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						inputType: [
							'url',
						],
					},
				},
				placeholder: 'https://example.com/passport.jpg',
				description: 'The public URL of the document image',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						inputType: [
							'file',
						],
					},
				},
				placeholder: 'data',
				description: 'The name of the binary property which contains the file',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const documentType = this.getNodeParameter('documentType', i) as string;
				const inputType = this.getNodeParameter('inputType', i) as string;

				let responseData;

				if (inputType === 'url') {
					const url = this.getNodeParameter('url', i) as string;
					responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'tinyIdpApi', {
						method: 'POST',
						url: `https://api.tiny-idp.com/api/extractors/run/${documentType}`,
						body: {
							urls: [url],
						},
						json: true,
					});
				} else if (inputType === 'file') {
					const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
					const binaryData = items[i].binary?.[binaryProperty];

					if (!binaryData) {
						throw new NodeOperationError(
							this.getNode(),
							`No binary data property "${binaryProperty}" found.`,
							{ itemIndex: i }
						);
					}

					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

					const boundary = '----n8nFormBoundary' + Math.random().toString(36).substring(2);
					const header = Buffer.from(
						`--${boundary}\r\n` +
						`Content-Disposition: form-data; name="files"; filename="${binaryData.fileName || 'document.jpg'}"\r\n` +
						`Content-Type: ${binaryData.mimeType || 'application/octet-stream'}\r\n\r\n`
					);
					const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
					const bodyBuffer = Buffer.concat([header, buffer, footer]);

					responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'tinyIdpApi', {
						method: 'POST',
						url: `https://api.tiny-idp.com/api/extractors/run/${documentType}`,
						headers: {
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
							'Content-Length': bodyBuffer.length,
						},
						body: bodyBuffer,
					});
				}

				const executionData = this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]);
				for (const executionItem of executionData) {
					if (executionItem.pairedItem === undefined) {
						executionItem.pairedItem = { item: i };
					}
					returnData.push(executionItem);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
