/**
 * Endpoints 
 */

const Endpoints = {
  Auth: {
    Login: "/api/auth/login/",
    Register: "/api/auth/register/",
    Logout: "/api/auth/logout/",
    Send_mail: "/api/auth/send-mail/",
    Verify_code: "/api/auth/check/",
    Forget_pass: "/api/auth/forget-pass/",
    Change_password: "/api/auth/change-password/",
    FortyTwo: "/api/auth/oauth/42/",
    Google: "/api/auth/oauth/google/",
    TwoFactorAuth: "/api/auth/login/2fa/",
  },
  Dashboard: {
      Add_achievements:'/api/dash/add-achievements/', 
      Update_achievements:'/api/dash/update-achievements/', 
      My_achievements:'/api/dash/my-achievements/',

      Get_card: '/api/dash/get-card/',
      Search: '/api/dash/search/',
      Edit: '/api/dash/edit/',
      UpdateAvatar: '/api/dash/update-profile/',

      Send_req: '/api/dash/send-req/',
      Cancel: '/api/dash/cancel/', 
      Accept_req: '/api/dash/accept-req/' ,
      Deny_req: '/api/dash/deny-req/',
      Unfriend: '/api/dash/unfriend/', 
      Block: '/api/dash/block/', 
      Unblock: '/api/dash/unblock/',
    
      Buy:'/api/dash/store/buy/',
      Equip:'/api/dash/store/equip/',
      Inventory:'/api/dash/inventory/',
      
      All_relations: '/api/dash/all-relations/',
      
      TwoFactorGetQR: '/api/dash/get-QR/',
      TwoFactorVerify: '/api/dash/verify-2fa/',
      TwoFactorUpdate: '/api/dash/update-2fa/',
      
      ResetCliToken: '/api/dash/reset-cli/',
      GetCliToken: '/api/dash/get-cli/',
      VerifyCliToken: '/api/dash/verify-cli/',
      // fastify.get('/api/dash/frienship-check/', FrCheckSchema, URController.friendShipCheckC)
      friendShipCheck: '/api/dash/frienship-check/'
  },
  Gateway: {
      Notifications: '/api/gateway/notifications/',
  }
};

export default Endpoints;