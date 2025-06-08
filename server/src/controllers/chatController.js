import { streamClient } from '../index.js';
import User from '../models/User.js';

export const getOrCreateSupportChannel = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const channelId = `support-${userId}`;
    const channelName = `Support - ${user.name}`;

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id.toString());

    // Members for the channel will be the user and all admins
    const members = [userId, ...adminIds];

    let channel = await streamClient.queryChannels({
      id: channelId,
      type: 'messaging',
    }, {}, { limit: 1 });

    if (channel.length === 0) {
      // Channel does not exist, create it
      channel = streamClient.channel('messaging', channelId, {
        name: channelName,
        members: members,
        created_by_id: userId,
        configs: {
          typing_events: true,
          read_events: true,
          connect_events: true,
          reactions: true,
          replies: true,
          search: true,
          typing_indicators: {
            enabled: true
          }
        }
      });
      await channel.create();
      await channel.addMembers(members);
    } else {
      channel = channel[0];
      // Ensure all admins are members of the channel
      await channel.addMembers(members.filter(memberId => !channel.state.members[memberId]));
    }

    res.json({ channel: channel.cid });

  } catch (error) {
    console.error('Error getting or creating support channel:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 