/**
 * Dashboard service for handling dashboard-related operations
 * @module lib/api/DashboardService
 */

import { ApiClient, ApiResponse } from './Client';
import { TokenManager } from './TokenManager';
import Endpoints from '@/constants/endpoints';
import {
	UserCardResponse,
	SearchUser,
	ChangePasswordRequest,
	ChangePasswordResponse,
	EditProfileRequest,
	EditProfileResponse,
	RelationshipsResponse,
	AchievementsResponse,
	Notifications,
	CliTokenResponse,
	CliTokenVerifyRequest
} from '@/types/Dashboard';
import {
	BuyItemRequest,
	InventoryResponse
} from '@/types/Store';
import {
	TwoFactorSetupResponse,
	TwoFactorVerifyRequest,
	TwoFactorVerifyResponse,
	TwoFactorUpdateRequest,
	TwoFactorUpdateResponse
} from '@/types/Auth';

export class DashboardService {
	private client: ApiClient;

	/**
	 * Create a new dashboard service instance
	 * @param apiClient Optional API client to use
	 */
	constructor(apiClient?: ApiClient) {
		this.client = apiClient || new ApiClient();
	}

	/**
	 * Get auth headers for authenticated requests
	 * @returns Auth headers or undefined if not authenticated
	 */
	private getAuthHeaders(): Record<string, string> | undefined {
		const token = TokenManager.getToken();
		if (!token) return undefined;

		return {
			'Authorization': `Bearer ${token}`
		};
	}

	/**
	 * Logout the user
	 * @returns API response
	 */
	async logout(): Promise<ApiResponse<any>> {
		try {
			TokenManager.clearTokens();
			return {
				data: null,
				status: { success: true, message: 'Logged out successfully' }
			};
		} catch (error) {
			return {
				data: null,
				status: { success: false, message: 'Failed to logout' }
			};
		}
	}

	/**
	 * Get user card data
	 * @param userId Optional user ID to get card for
	 * @returns User card data
	 */
	async getCard(userId?: string): Promise<ApiResponse<UserCardResponse['data']>> {
		const endpoint = userId
			? `${Endpoints.Dashboard.Get_card}?id=${userId}`
			: Endpoints.Dashboard.Get_card;
	
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		// if (response.status.success) {
		// 	const avatar = response.data.User.avatar;
		// 	if (typeof avatar === 'string') {
		// 		response.data.User.avatar = avatar.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
		// 	}
		// }
		return this.adaptResponse<UserCardResponse['data']>(response);
	}	

	/**
	 * Search users
	 * @param query Search query
	 * @returns Search results
	 */
	async search(query: string): Promise<ApiResponse<SearchUser[]>> {
		const endpoint = `${Endpoints.Dashboard.Search}?q=${encodeURIComponent(query)}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		// if (response.status.success) {
		// 	const avatar = response.data.avatar;
		// 	if (typeof avatar === 'string') {
		// 		response.data.avatar = avatar.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
		// 	}
		// }		
		return this.adaptResponse<SearchUser[]>(response);
	}

	/**
	 * Get user by username
	 * @param username Username to search for
	 * @returns User data
	 */
	async getUserByUsername(username: string): Promise<ApiResponse<SearchUser>> {
		const response = await this.search(username);

		if (!response.status.success || !response.data) {
			return {
				data: null,
				status: {
					success: false,
					message: response.status.message || 'User not found'
				}
			};
		}

		const user = response.data.find(u => u.username === username);
		if (!user) {
			return {
				data: null,
				status: {
					success: false,
					message: 'User not found'
				}
			};
		}

		return {
			data: user,
			status: {
				success: true,
				message: 'User found'
			}
		};
	}

	/**
	 * Edit user profile
	 * @param data Profile data to update
	 * @returns API response
	 */
	async editProfile(data: EditProfileRequest): Promise<ApiResponse<EditProfileResponse>> {
		const response = await this.client.post<any>(Endpoints.Dashboard.Edit, data, this.getAuthHeaders());
		return this.adaptResponse<EditProfileResponse>(response);
	}

	/**
	 * Change user password
	 * @param data Password change data
	 * @returns API response
	 */
	async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse['data']>> {
		const response = await this.client.post<any>(
			Endpoints.Auth.Change_password,
			{
				old_pass: data.oldPassword,
				new_pass: data.newPassword
			},
			this.getAuthHeaders()
		);
		return this.adaptResponse<ChangePasswordResponse['data']>(response);
	}

	/**
	 * Get QR code for 2FA setup
	 * @returns QR code data URL
	 */
	async getTwoFactorQR(): Promise<ApiResponse<TwoFactorSetupResponse>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.TwoFactorGetQR, this.getAuthHeaders());
		return this.adaptResponse<TwoFactorSetupResponse>(response);
	}

	/**
	 * Verify 2FA code during setup
	 * @param code 6-digit verification code
	 * @returns Verification result
	 */
	async verifyTwoFactorSetup(code: string): Promise<ApiResponse<TwoFactorVerifyResponse>> {
		const data: TwoFactorVerifyRequest = { code };
		const response = await this.client.post<any>(Endpoints.Dashboard.TwoFactorVerify, data, this.getAuthHeaders());
		return this.adaptResponse<TwoFactorVerifyResponse>(response);
	}

	/**
	 * Verify 2FA code for disabling
	 * @param code 6-digit verification code
	 * @returns Verification result
	 */
	async verifyTwoFactorCode(code: string): Promise<ApiResponse<TwoFactorVerifyResponse>> {
		const data: TwoFactorVerifyRequest = { code };
		const response = await this.client.post<any>(Endpoints.Dashboard.TwoFactorVerify, data, this.getAuthHeaders());
		return this.adaptResponse<TwoFactorVerifyResponse>(response);
	}

	/**
	 * Update 2FA status (enable/disable)
	 * @param activate 1 to enable, 0 to disable
	 * @returns Update result
	 */
	async updateTwoFactorStatus(activate: 0 | 1): Promise<ApiResponse<TwoFactorUpdateResponse>> {
		const endpoint = `${Endpoints.Dashboard.TwoFactorUpdate}?activate=${activate}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<TwoFactorUpdateResponse>(response);
	}

	/**
	 * Send a friend request
	 * @param userId User ID to send request to
	 * @returns API response
	 */
	async sendFriendRequest(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Send_req}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Cancel a friend request
	 * @param userId User ID to cancel request for
	 * @returns API response
	 */
	async cancelFriendRequest(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Cancel}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Accept a friend request
	 * @param userId User ID to accept request from
	 * @returns API response
	 */
	async acceptFriendRequest(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Accept_req}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Deny a friend request
	 * @param userId User ID to deny request from
	 * @returns API response
	 */
	async denyFriendRequest(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Deny_req}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Remove a friend
	 * @param userId User ID to unfriend
	 * @returns API response
	 */
	async unfriend(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Unfriend}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Block a user
	 * @param userId User ID to block
	 * @returns API response
	 */
	async blockUser(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Block}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Unblock a user
	 * @param userId User ID to unblock
	 * @returns API response
	 */
	async unblockUser(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.Unblock}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Get all relationships
	 * @returns Relationship data
	 */
	async getAllRelations(): Promise<ApiResponse<RelationshipsResponse>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.All_relations, this.getAuthHeaders());
		return this.adaptResponse<RelationshipsResponse>(response);
	}

	/**
	 * Get user achievements
	 * @returns Achievement data
	 */
	async getAchievements(): Promise<ApiResponse<AchievementsResponse>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.My_achievements, this.getAuthHeaders());
		return this.adaptResponse<AchievementsResponse>(response);
	}

	/**
	 * Buy an item from the store
	 * @param data Item data
	 * @returns API response
	 */
	async buyItem(data: BuyItemRequest): Promise<ApiResponse<null>> {
		const response = await this.client.post<any>(Endpoints.Dashboard.Buy, data, this.getAuthHeaders());
		return this.adaptResponse<null>(response);
	}

	/**
	 * Equip an item
	 * @param data Item data
	 * @returns API response
	 */
	async equipItem(data: BuyItemRequest): Promise<ApiResponse<null>> {
		const response = await this.client.post<any>(Endpoints.Dashboard.Equip, data, this.getAuthHeaders());
		return this.adaptResponse<null>(response);
	}

	/**
	 * Get user inventory
	 * @returns Inventory data
	 */
	async getInventory(): Promise<ApiResponse<InventoryResponse>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.Inventory, this.getAuthHeaders());
		return this.adaptResponse<InventoryResponse>(response);
	}

	/**
	 * Upload user avatar
	 * @param file The image file to upload (must be JPEG or PNG, max 10MB)
	 * @returns API response with the avatar URL
	 */
	async uploadAvatar(file: File): Promise<ApiResponse<{avatar: string}>> {
		if (!file) {
			throw new Error('No file provided');
		}

		// Check if file is an image
		if (!file.type.startsWith('image/')) {
			throw new Error('File must be an image');
		}

		// Only allow jpeg and png formats
		if (file.type !== 'image/png') {
			throw new Error('Only PNG formats are allowed');
		}

		// Check file size (max 10MB)
		if (file.size > 5 * 1024 * 1024) {
			throw new Error('File size exceeds 5MB limit');
		}

		const formData = new FormData();
		formData.append('file', file);

		const response = await this.client.postFormData<any>(
			Endpoints.Dashboard.UpdateAvatar,
			formData,
			this.getAuthHeaders()
		);
		
		return this.adaptResponse<{avatar: string}>(response);
	}

	/**
	 * Get CLI token
	 * @returns CLI token data
	 */
	async getCliToken(): Promise<ApiResponse<CliTokenResponse>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.GetCliToken, this.getAuthHeaders());
		return this.adaptResponse<CliTokenResponse>(response);
	}

	/**
	 * Reset CLI token
	 * @returns API response
	 */
	async resetCliToken(): Promise<ApiResponse<any>> {
		const response = await this.client.get<any>(Endpoints.Dashboard.ResetCliToken, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * Verify CLI token
	 * @param code Verification code
	 * @returns API response
	 */
	async verifyCliToken(code: string): Promise<ApiResponse<any>> {
		const data: CliTokenVerifyRequest = { code };
		const response = await this.client.post<any>(Endpoints.Dashboard.VerifyCliToken, data, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}

	/**
	 * 
	 * @param response API response to adapt
	 * @returns 
	 */
	async getNotifications(): Promise<ApiResponse<Notifications>> {
		const response = await this.client.get<any>(Endpoints.Gateway.Notifications, this.getAuthHeaders());
		return this.adaptResponse<Notifications>(response);
	}

	async friendShipCheck(userId: string): Promise<ApiResponse<any>> {
		const endpoint = `${Endpoints.Dashboard.friendShipCheck}?id=${userId}`;
		const response = await this.client.get<any>(endpoint, this.getAuthHeaders());
		return this.adaptResponse<any>(response);
	}


	private adaptResponse<T>(response: ApiResponse<any>): ApiResponse<T> {
		if (!response.status.success) return response as ApiResponse<T>;
		
		return {
			data: response.data as T,
			status: response.status
		};
	}
} 