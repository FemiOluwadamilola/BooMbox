const router = require('express').Router();
const {trackPlaylist,addTrackToPlaylist,userPlaylist,playlistShare,playlistFromFriend,deletePlaylist} = require('../controllers/playlist');
const verifyToken = require('../middlewares/Auth_verify');

// CREATE TRACK PLAYLIST
router.post('/', verifyToken, trackPlaylist)

// ADD TRACKS TO PLAYLIST
router.put('/', verifyToken, addTrackToPlaylist)


// VIEW PLAYLISTS
router.get('/', verifyToken, userPlaylist)


// SHARE PLAYLIST WITH FRIEND
router.get('/:id/share_playlist', verifyToken, playlistShare)

// GET PLAYLIST FROM FRIEND
router.get('/get_playlist', verifyToken, playlistFromFriend);

// DELETE PLAYLIST
router.delete('/:id', verifyToken, deletePlaylist);

module.exports = router;
