import Jwt from 'jsonwebtoken';
import { error } from '@sveltejs/kit';
import seniorModel from '$lib/db/senior';
import juniorModel from '$lib/db/junior';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, locals }) {
	const { token } = await request.json();
	const { email } = await Jwt.decode(token);
  if (!(email.endsWith('@kmitl.ac.th'))) {
    throw error(400, "Please use @kmitl.ac.th");
  };
  const std_id = email.split('@')[0]; // ดึงค่าเฉพาะรหัสนักศึกษามา
  let user = null; // Initialize user variable

  if (String(std_id).startsWith('64') || String(std_id).startsWith('63')) { // พี่
    let payload = await seniorModel.findOne({ std_id:Number(std_id) });
    user = {
      std_id:payload.std_id,
      std_name:payload.std_name
    }
  } else { // น้อง
    let payload = await juniorModel.findOne({ std_id:Number(std_id) });
    user = {
      std_id:payload.std_id,
      std_name:payload.std_name
    }
  };

  if (!user) {
    throw error(400, "User not found");
  }
  const payload = Jwt.sign({user}, 'sairahut_super_secret');
  
	return new Response(JSON.stringify({ token: payload }));
}
