const User = require('../models/User');

exports.addAuditor = async (req,res)=>{
  try{
    const { email } = req.body;
    let user = await User.findOne({ email });
    if(!user) return res.status(404).json({ msg:'User not found to promote' });
    user.role = 'auditor';
    await user.save();
    res.json({ msg:'User promoted to auditor', user });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}
