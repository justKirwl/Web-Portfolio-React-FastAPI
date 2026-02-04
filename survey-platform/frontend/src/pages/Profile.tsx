import { Mail, Calendar, MapPin, Edit2, Save, X, Camera, BarChart3, Star, Settings, Eye, EyeOff, ArrowLeft, LoaderCircle, Check, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useProfileStore } from '../stores/ProfileStore';
import { useEffect, useMemo, useRef } from 'react';
import { useImageCropStore } from '../stores/ImageCropStore';
import { useDropzone } from 'react-dropzone'
import { useTranslation } from '../../node_modules/react-i18next';
import CropperModal from '../components/CropperModal';
import { achievements } from '../utils/achievements';
import { profileBadges } from '../utils/profileBadges';
import { useVerifyFlowStore } from '../stores/VerifyDeleteFlow';
import VerifyDeleteFlow from '../components/VerifyDeleteFlow';
import { useDeleteStore } from '../stores/DeleteModalStore';
import DeleteModal from '../components/DeleteModal';

export default function Profile() {
  const { userData, isEditing, stats, activeTab, setActiveTab, setIsEditing, fetchUser, onDropAvatar, isAvatarChanged, isAvatarChanging, setUserData, isUpdatedPersonalInfo, isUpdatingPersonalInfo, updatePersonalInfo, recentActivity, switchTrackActivity, settingsData, changeBanner, setBannerError, bannerError } = useProfileStore()
  const { isOpen, setOpen: setVerifyFlowOpen } = useVerifyFlowStore()
  const { imageUrl, setImageUrl } = useImageCropStore()
  const { isOpen: isDeleteModalOpen } = useDeleteStore()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()
  const theme = localStorage.getItem('user-theme') || 'light'

  const tabs = t('profile.tabs', { returnObjects: true }) as { overview: string, achievements: string, activity: string, settings: string }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: onDropAvatar
  })

  useEffect(() => {
    if (isFetched.current) return

    fetchUser()
    setActiveTab(tabs.overview.toLowerCase())

    isFetched.current = true
  }, [])

  useEffect(() => {
    if (isAvatarChanged) {
      setTimeout(() => {
        useProfileStore.setState(state => ({ ...state, isAvatarChanged: false }))
      }, 3000)
    }
  }, [isAvatarChanged])

  useEffect(() => {
    if (isUpdatedPersonalInfo) {
      setTimeout(() => {
        useProfileStore.setState(state => ({ ...state, isUpdatedPersonalInfo: false }))
      }, 2000)
    }
  }, [isUpdatedPersonalInfo])

  const profileBadgeObject = useMemo(() => {
    return profileBadges.find(obj => obj.id === userData.profileBadge)
  }, [userData.profileBadge])

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">
      
      <div className="relative h-80 overflow-hidden">
        
        {userData.banner && (
          <div className='absolute inset-0'>
            <img src={userData.banner} alt={'Some banner should be there.'} className='select-none'/>
          </div>
        )}

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, ${theme === 'light' ? 'gray' : 'white'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>

        <div className="absolute top-6 left-6 z-10">
          <button onClick={() => window.history.back()} className={`px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-${theme === 'light' ? userData.banner ? 'white' : 'gray' : 'white'} hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg`}>
            <ArrowLeft className="w-5 h-5" />
            {t('profile.back')}
          </button>
        </div>

        <div className="absolute top-6 right-6 z-10">
          <label htmlFor="banner-change">
            <div className={`cursor-pointer px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-${theme === 'light' ? userData.banner ? 'white' : 'gray' : 'white'} hover:bg-white/30 transition-all duration-200 flex items-center gap-2 shadow-lg ${bannerError && 'shake'}`}>
              <Camera className="w-4 h-4" />
              {bannerError ? t('profile.bannerError') : t('profile.changeCover')}
            </div>
          </label>
          <input type="file" name="banner-change" id="banner-change" className='hidden' accept='image/*' onChange={(e) => {
            if (bannerError) {
              setBannerError(null)
            }

            changeBanner(e)
          }}/>
        </div>
      </div>

      
      <div className="container mx-auto px-6 -mt-32 relative z-20 opacity-98">
        {imageUrl && <CropperModal />}
        {isOpen && <VerifyDeleteFlow />}
        {isDeleteModalOpen && <DeleteModal />}

        <div className="max-w-7xl mx-auto">
          
          <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] shadow-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">

              <div className="relative" {...getRootProps()}>
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                    <img src={userData.avatar} alt={t('profile.avatarAlt')} className={`rounded-full object-cover h-full w-auto transition-all duration-200 ${isDragActive && 'translate-y-[-4px]'} select-none`}/>
                  </div>
                  <label htmlFor="change-avatar">
                    <div className='cursor-pointer absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg'>
                      {isAvatarChanging ? <LoaderCircle className='w-5 h-5 animate-spin'/> : isAvatarChanged ? <Check className='w-5 h-5'/> : <Camera className="w-5 h-5" /> }
                    </div>
                  </label>
                  <input {...getInputProps()} type="file" name="change-avatar" id="change-avatar" className='hidden' onChange={(e) => {
                    setImageUrl(URL.createObjectURL(e.target.files[0]))
                  }}/>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-black text-[var(--color-base-content)] mb-2">
                      {userData.fullName}
                    </h1>
                    <p className="text-lg text-[var(--color-primary)] font-semibold">@{userData.username}</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-bold hover:scale-102 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Edit2 className="w-5 h-5" />
                      {t('profile.editProfile')}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={updatePersonalInfo} className="px-6 py-3 rounded-2xl bg-green-600 text-white font-bold hover:scale-102 transition-all shadow-lg flex items-center gap-2">
                        
                        {isUpdatingPersonalInfo ? (

                          <><LoaderCircle className='w-5 h-5' />
                          {t('profile.saving')}</>

                        ) : isUpdatedPersonalInfo ? (
                          <><Check className='w-5 h-5'/>
                          {t('profile.saved')}</>
                        ) : (
                          <><Save className="w-5 h-5" />
                          {t('profile.save')}</>
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:scale-102 transition-all shadow-lg flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        {t('profile.cancel')}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[var(--color-base-content)] mb-6 text-lg">{userData.bio}</p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)]">
                    <Mail className="w-4 h-4 text-purple-500" />
                    {userData.email}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)]">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    {userData.location}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)]">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {t('profile.joined')} {new Date(userData.joinDate).toLocaleString('en-CA', { hour12: false }).replace(/,/, '').replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3')}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/20 border border-purple-500/30">
                    <p className="text-3xl font-black text-purple-600 mb-1">{stats.surveys}</p>
                    <p className="text-sm text-[var(--color-base-content)] opacity-70">{t('profile.stats.surveys')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/20 border border-pink-500/30">
                    <p className="text-3xl font-black text-pink-600 mb-1">{stats.quizes}</p>
                    <p className="text-sm text-[var(--color-base-content)] opacity-70">{t('profile.stats.quizes')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 border border-blue-500/30">
                    <p className="text-3xl font-black text-blue-600 mb-1">{stats.responses}</p>
                    <p className="text-sm text-[var(--color-base-content)] opacity-70">{t('profile.stats.responses')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 border border-yellow-500/30">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <p className="text-3xl font-black text-yellow-600">{stats.avgRating}</p>
                    </div>
                    <p className="text-sm text-[var(--color-base-content)] opacity-70">{t('profile.stats.avgRating')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[...Object.values(tabs).map(str => str.toLowerCase())].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl font-bold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--color-primary)] text-white shadow-lg scale-105'
                    : 'bg-[var(--color-base-200)] border border-[var(--color-base-300)] text-[var(--color-base-content)] hover:border-purple-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {activeTab === tabs.overview.toLowerCase() && (
              <>
                <div className="lg:col-span-2 space-y-6">

                  <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] p-6 shadow-xl">
                    <h3 className="text-2xl font-black text-[var(--color-base-content)] mb-6 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      {t('profile.personalInfo')}
                    </h3>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--color-base-content)]">{t('profile.fields.bio')}</label>
                          <textarea
                            value={userData.bio}
                            rows={3}
                            name='bio'
                            placeholder={t('profile.fields.bioPlaceholder')}
                            onChange={setUserData}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-purple-500 focus:outline-none resize-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--color-base-content)]">{t('profile.fields.location')}</label>
                          <input
                            type="text"
                            value={userData.location}
                            name='location'
                            placeholder={t('profile.fields.locationPlaceholder')}
                            onChange={setUserData}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-purple-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--color-base-content)]">{t('profile.fields.company')}</label>
                          <input
                            type="text"
                            value={userData.company}
                            name='company'
                            onChange={setUserData}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-purple-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--color-base-content)]">{t('profile.fields.website')}</label>
                          <input
                            type="text"
                            value={userData.website}
                            name='website'
                            onChange={setUserData}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-purple-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[var(--color-base-100)]">
                          <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('profile.fields.company')}</p>
                          <p className="text-[var(--color-base-content)] font-bold">{userData.company}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--color-base-100)]">
                          <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('profile.fields.website')}</p>
                          <button className="text-purple-600 hover:underline font-bold">{userData.website}</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] p-6 shadow-xl">
                    <h3 className="text-2xl font-black text-[var(--color-base-content)] mb-6 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                      {t('profile.recentActivity')}
                    </h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-[var(--color-base-100)] rounded-2xl transition-all">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--color-base-content)] font-bold">
                              <span className="text-purple-600">{activity.action}</span> {activity.item}
                            </p>
                            <p className="text-sm text-[var(--color-base-content)] opacity-60">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">

                  <div className={`relative overflow-hidden bg-gradient-to-br ${profileBadgeObject?.bgColor} rounded-3xl p-6 min-h-[20%] text-white shadow-2xl`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    {profileBadgeObject?.icon}
                    <h4 className="font-black text-2xl mb-2 relative z-10">{profileBadgeObject?.title}</h4>
                    <p className="opacity-90 relative z-10">{profileBadgeObject?.desc}</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === tabs.achievements.toLowerCase() && (
              <div className="lg:col-span-3">
                <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] p-8 shadow-xl">
                  <h3 className="text-3xl font-black text-[var(--color-base-content)] mb-8 flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-500" />
                    {t('profile.achievements.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {userData.achievements ? userData.achievements.map(achievement => {
                      const achievementDetail = achievements.find(ach => ach.id == achievement.id)

                      return (
                        <div key={achievement.id} className="bg-[var(--color-base-100)] rounded-3xl p-6 text-center hover:scale-105 transition-all border border-[var(--color-base-300)] shadow-lg">
                        <div className="text-6xl mb-4 pointer-events-none select-none">{achievementDetail?.icon}</div>
                        <p className="text-sm text-[var(--color-base-content)] opacity-70 mb-2">{achievementDetail?.description}</p>
                        <p className="text-xs text-[var(--color-base-content)] opacity-50 font-semibold">{achievement.date && new Date(achievement.date * 1000).toLocaleDateString('en-CA')}</p>
                      </div>
                      )
                    }) : [1, 2, 3].map(value => (
                      <div key={value} className='bg-[var(--color-base-100)] rounded-3xl p-6 text-center hover:scale-105 transition-all border border-[var(--color-base-300)] shadow-lg'></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === tabs.activity.toLowerCase() && (
              <div className="lg:col-span-3">
                <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] p-8 shadow-xl">
                  <h3 className="text-3xl font-black text-[var(--color-base-content)] mb-8">{t('profile.activity.title')}</h3>
                  
                  {settingsData.trackActivity ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-5 bg-[var(--color-base-100)] rounded-2xl border border-[var(--color-base-300)]">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="w-7 h-7 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--color-base-content)] font-bold text-lg">
                              <span className="text-purple-600">{activity.action}</span> {activity.item}
                            </p>
                            <p className="text-sm text-[var(--color-base-content)] opacity-60">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="relative mb-8">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-dashed border-red-500/30 flex items-center justify-center">
                          <Eye className="w-16 h-16 text-red-500/40" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <h4 className="text-2xl font-black text-[var(--color-base-content)] mb-3">
                        {t('profile.activity.disabledTitle')}
                      </h4>
                      
                      <p className="text-[var(--color-base-content)] opacity-60 max-w-md text-center mb-6">
                        {t('profile.activity.disabledDesc')}
                      </p>
                      
                      <button
                        onClick={() => setActiveTab(tabs.settings.toLowerCase())}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Settings className="w-5 h-5" />
                        {t('profile.activity.goToSettings')}
                      </button>
                      
                      <div className="mt-8 p-4 rounded-2xl bg-[var(--color-base-100)] border border-[var(--color-base-300)] max-w-md">
                        <p className="text-sm text-[var(--color-base-content)] opacity-70 text-center">
                          <strong>{t('profile.activity.tipTitle')}</strong>{t('profile.activity.tipDesc')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === tabs.settings.toLowerCase() && (
              <div className="lg:col-span-3">
                <div className="bg-[var(--color-base-200)] rounded-3xl border border-[var(--color-base-300)] p-8 shadow-xl">
                  <h3 className="text-3xl font-black text-[var(--color-base-content)] mb-8">{t('profile.settings.title')}</h3>
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-black text-xl text-[var(--color-base-content)] mb-4">{t('profile.settings.profileSettings')}</h4>
                      <div className="space-y-3">
                        {[{ id: t('profile.settings.trackActivity'), subId: 'track' }].map((item, idx) => (
                          <label key={idx} className="flex items-center gap-4 p-4 bg-[var(--color-base-100)] rounded-2xl cursor-pointer hover:bg-[var(--color-base-300)] transition-all">
                            <input type="checkbox" onChange={switchTrackActivity} checked={settingsData.trackActivity} className="w-5 h-5 accent-purple-600" />
                            <span className="text-[var(--color-base-content)] font-semibold">{item.id}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--color-base-300)]">
                      <h4 className="font-black text-xl text-red-600 mb-4">{t('profile.settings.dangerZone')}</h4>
                      <button
                        onClick={() => setVerifyFlowOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:scale-105 transition-all shadow-lg">
                      {t('profile.settings.deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}