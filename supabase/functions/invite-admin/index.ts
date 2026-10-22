import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods':'POST, OPTIONS',
};
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers:cors});
 const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 try{
  const auth=req.headers.get('Authorization');if(!auth)return Response.json({error:'Authentication required'},{status:401,headers:cors});
  const callerClient=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
  const {data:{user:caller},error:authError}=await callerClient.auth.getUser();if(authError||!caller)return Response.json({error:'Invalid session'},{status:401,headers:cors});
  const adminClient=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:allowed}=await adminClient.from('admin_users').select('user_id').eq('user_id',caller.id).eq('is_active',true).maybeSingle();
  if(!allowed)return Response.json({error:'Administrator access required'},{status:403,headers:cors});
  const body=await req.json();const email=String(body.email||'').trim().toLowerCase(),fullName=String(body.fullName||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||fullName.length<2)return Response.json({error:'Nome e email válidos são obrigatórios.'},{status:400,headers:cors});
  const {data,error}=await adminClient.auth.admin.inviteUserByEmail(email,{data:{full_name:fullName}});if(error)throw error;if(!data.user)throw new Error('O convite não retornou usuário.');
  const {error:insertError}=await adminClient.from('admin_users').upsert({user_id:data.user.id,email,full_name:fullName,is_active:true});if(insertError)throw insertError;
  return Response.json({user_id:data.user.id,email},{status:201,headers:cors});
 }catch(error){console.error('invite-admin error',error);return Response.json({error:error instanceof Error?error.message:'Falha ao enviar convite.'},{status:500,headers:cors});}
});
