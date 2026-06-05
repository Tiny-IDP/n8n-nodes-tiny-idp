import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TinyIdpApi implements ICredentialType {
	name = 'tinyIdpApi';

	displayName = 'Tiny IDP API';

	documentationUrl = 'https://tiny-idp.com/docs';

	icon = {
		light: 'file:../nodes/TinyIdp/tidp-logo.svg',
		dark: 'file:../nodes/TinyIdp/tidp-logo.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.tiny-idp.com/api',
			url: '/v1/user',
		},
	};
}
