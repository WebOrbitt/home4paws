import { pets } from './pets.js'

const rescuePhoto = (photoId) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`

export const demoOrganizations = [
  {
    id: 'happy-paws-foundation', name: 'Happy Paws Foundation', type: 'NGO',
    registrationNumber: 'MH/NGO/2018/042', yearEstablished: '2018',
    description: 'A volunteer-led animal welfare group providing rescue, treatment, and foster care for animals across Mumbai.',
    contactPerson: 'Ananya Shah', designation: 'Rescue Coordinator', email: 'hello@happypaws.example', mobile: '+91 90000 00001',
    address: '14 Hill Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
    documents: { registrationCertificate: 'happy-paws-registration.pdf', authorizedPersonId: 'ananya-shah-id.pdf', addressProof: 'happy-paws-address.pdf' },
    status: 'Pending', submittedAt: '24 Sep 2026', verificationDate: '', rejectionReason: '',
  },
  {
    id: 'paw-care-shelter', name: 'Paw Care Shelter', type: 'SHELTER',
    registrationNumber: 'MH/SH/2020/116', yearEstablished: '2020',
    description: 'A small shelter focused on temporary care and responsible adoption for animals found in Thane.',
    contactPerson: 'Rohan Desai', designation: 'Shelter Manager', email: 'team@pawcare.example', mobile: '+91 90000 00002',
    address: '8 Lake View Road', city: 'Thane', state: 'Maharashtra', pincode: '400602',
    documents: { registrationCertificate: 'paw-care-certificate.pdf', authorizedPersonId: 'rohan-desai-id.jpg', addressProof: 'paw-care-address.pdf' },
    status: 'Pending', submittedAt: '23 Sep 2026', verificationDate: '', rejectionReason: '',
  },
  {
    id: 'pune-animal-rescue', name: 'Pune Animal Rescue', type: 'NGO',
    registrationNumber: 'MH/NGO/2016/031', yearEstablished: '2016',
    description: 'Community-based rescue and foster network serving Pune and nearby areas.',
    contactPerson: 'Meera Kulkarni', designation: 'Director', email: 'contact@pune-rescue.example', mobile: '+91 90000 00003',
    address: '22 Aundh Road', city: 'Pune', state: 'Maharashtra', pincode: '411007',
    documents: { registrationCertificate: 'pune-rescue-registration.pdf', authorizedPersonId: 'meera-kulkarni-id.pdf', addressProof: 'pune-rescue-address.pdf' },
    status: 'Approved', submittedAt: '10 Sep 2026', verificationDate: '10 Sep 2026', rejectionReason: '',
  },
  {
    id: 'navi-mumbai-animal-care', name: 'Navi Mumbai Animal Care', type: 'SHELTER',
    registrationNumber: 'MH/SH/2019/089', yearEstablished: '2019',
    description: 'A neighbourhood shelter helping animals recover and find suitable homes.',
    contactPerson: 'Kavita Patil', designation: 'Trustee', email: 'care@nmac.example', mobile: '+91 90000 00004',
    address: '5 Palm Beach Road', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703',
    documents: { registrationCertificate: 'nmac-certificate.pdf', authorizedPersonId: 'kavita-patil-id.jpg', addressProof: 'nmac-address.pdf' },
    status: 'Rejected', submittedAt: '08 Sep 2026', verificationDate: '', rejectionReason: 'Please provide a clearer copy of the address proof.',
  },
]

export const demoUsers = [
  { id: 'user-001', name: 'Aarav Mehta', email: 'aarav@example.com', mobile: '+91 90000 00101', accountType: 'Adopter', status: 'Active', registeredAt: '18 Sep 2026' },
  { id: 'user-002', name: 'Nisha Rao', email: 'nisha@example.com', mobile: '+91 90000 00102', accountType: 'Public User', status: 'Active', registeredAt: '17 Sep 2026' },
  { id: 'user-003', name: 'Kabir Joshi', email: 'kabir@example.com', mobile: '+91 90000 00103', accountType: 'Adopter', status: 'Inactive', registeredAt: '15 Sep 2026' },
  { id: 'user-004', name: 'Happy Paws Foundation', email: 'hello@happypaws.example', mobile: '+91 90000 00001', accountType: 'NGO/Shelter', status: 'Active', registeredAt: '12 Sep 2026' },
  { id: 'user-005', name: 'Paw Care Shelter', email: 'team@pawcare.example', mobile: '+91 90000 00002', accountType: 'NGO/Shelter', status: 'Active', registeredAt: '11 Sep 2026' },
]

const organizationIdByPetName = {
  'Pune Animal Rescue': 'pune-animal-rescue',
  'Happy Paws Animal Welfare': 'happy-paws-foundation',
  'Paw Care Shelter': 'paw-care-shelter',
  'Thane Paws Collective': 'paw-care-shelter',
  'Navi Mumbai Animal Care': 'navi-mumbai-animal-care',
}

export const demoAdminPets = [
  ...pets.map((pet) => {
    const organizationName = pet.id === 'coco' ? 'Paw Care Shelter' : pet.organizationName
    const adoptionStatus = pet.id === 'coco' ? 'Under Adoption' : pet.status === 'adopted' ? 'Adopted' : 'Available'
    return {
      ...pet,
      species: pet.id === 'pepper' ? 'Rabbit' : pet.species,
      organizationName,
      organization: organizationName,
      organizationId: organizationIdByPetName[organizationName],
      adoptionStatus,
      status: adoptionStatus === 'Under Adoption' ? 'under-adoption' : pet.status,
      rescueReportId: '',
      ageUnit: /\bmonths?\b/i.test(pet.age) ? 'months' : 'years',
      ageValue: pet.age.match(/^\d+/)?.[0] || '',
      ageUnknown: pet.age === 'Unknown',
      images: [...(pet.images || [pet.image])],
      address: '',
      city: pet.location,
      state: ['Pune', 'Mumbai', 'Thane', 'Navi Mumbai'].includes(pet.location) ? 'Maharashtra' : '',
      pincode: '',
      goodWithDogs: pet.goodWithPets?.dogs ?? null,
      goodWithCats: pet.goodWithPets?.cats ?? null,
      isActive: true,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    }
  }),
  {
    id: 'max-pune', name: 'Max', species: 'Dog', breed: 'Indie Dog', age: '4 years', ageValue: '4', ageUnit: 'years', ageGroup: 'adult', ageUnknown: false,
    gender: 'Male', size: 'Medium', location: 'Pune', image: rescuePhoto('photo-1537151608828-ea2b11777ee8'), imageAlt: 'Indie dog resting outside',
    images: [rescuePhoto('photo-1537151608828-ea2b11777ee8')], description: 'Max is a calm, friendly companion who enjoys an easy routine.',
    rescueStory: 'He was found wandering near a residential area and brought into care by local volunteers.',
    currentSituation: 'Max is safe with Pune Animal Rescue and has already found a home.',
    personality: ['Calm', 'Friendly'], goodWithChildren: true, goodWithDogs: true, goodWithCats: false, goodWithStrangers: true,
    goodWithPets: { dogs: true, cats: false }, activityLevel: 'Moderate', vaccinated: true, sterilized: true,
    medicalCondition: 'None known', specialNeeds: 'None', organizationName: 'Pune Animal Rescue', organization: 'Pune Animal Rescue', organizationId: 'pune-animal-rescue',
    rescueReportId: '', adoptionStatus: 'Adopted', status: 'adopted', isActive: true, address: '', city: 'Pune', state: 'Maharashtra', pincode: '',
    createdAt: '2026-09-01T09:00:00.000Z', updatedAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'bruno-report-five', name: 'Bruno', species: 'Dog', breed: 'Indie', age: 'Adult', ageValue: '', ageUnit: 'years', ageGroup: 'adult', ageUnknown: true,
    gender: 'Unknown', size: 'Medium', location: 'Mumbai', image: rescuePhoto('photo-1552053831-71594a27632d'), imageAlt: 'Indie dog standing outdoors',
    images: [rescuePhoto('photo-1552053831-71594a27632d')], description: 'Bruno is recovering in care and ready for a pet profile.',
    rescueStory: 'Bruno was reported as a lost dog in Mumbai and has been safely brought into care.', currentSituation: 'Bruno is receiving care through Pune Animal Rescue.',
    personality: [], goodWithChildren: null, goodWithDogs: null, goodWithCats: null, goodWithStrangers: null,
    goodWithPets: { dogs: null, cats: null }, activityLevel: '', vaccinated: null, sterilized: null,
    medicalCondition: '', specialNeeds: '', organizationName: 'Pune Animal Rescue', organization: 'Pune Animal Rescue', organizationId: 'pune-animal-rescue',
    rescueReportId: 'RR-2026-005', adoptionStatus: 'Available', status: 'available', isActive: true,
    address: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '', createdAt: '2026-09-01T09:00:00.000Z', updatedAt: '2026-09-01T09:00:00.000Z',
  },
]

export const demoRescueReports = [
  {
    id: 'RR-2026-001', animalType: 'Dog', breed: 'Indie', age: 'Adult', gender: 'Unknown', condition: 'Injured',
    description: 'Found near the park entrance in Bandra; moving slowly and appears to have a sore front leg.', photo: rescuePhoto('photo-1552053831-71594a27632d'),
    address: '12 Hill Road, Bandra West', city: 'Bandra', state: 'Maharashtra', pincode: '400050', dateFound: '2026-09-24',
    reporterName: 'Sample Reporter', reporterMobile: '+91 90000 00201', reporterEmail: 'reporter@example.com', status: 'Pending Review', reportedAt: '24 Sep 2026', createdAt: '2026-09-24T09:00:00.000Z', updatedAt: '2026-09-24T09:00:00.000Z',
  },
  {
    id: 'RR-2026-002', animalType: 'Cat', breed: 'Domestic shorthair', age: 'Young', gender: 'Female', condition: 'Abandoned',
    description: 'A young cat was found alone near an apartment entrance in Andheri.', photo: rescuePhoto('photo-1514888286974-6c03e2ca1dba'),
    address: '4 Station Road', city: 'Andheri', state: 'Maharashtra', pincode: '400053', dateFound: '2026-09-23',
    reporterName: 'Sample Reporter', reporterMobile: '+91 90000 00202', reporterEmail: 'helper@example.com', status: 'NGO Assigned', assignedOrganizationId: 'pune-animal-rescue', assignedOrganizationName: 'Pune Animal Rescue', reportedAt: '23 Sep 2026', createdAt: '2026-09-23T09:00:00.000Z', updatedAt: '2026-09-23T09:00:00.000Z',
  },
  {
    id: 'RR-2026-003', animalType: 'Dog', breed: 'Indie', age: 'Adult', gender: 'Male', condition: 'Injured',
    description: 'A dog was found limping near the station in Santacruz and is now being transported for care.', photo: rescuePhoto('photo-1561037404-61cd46aa615b'),
    address: '18 Station Road', city: 'Santacruz', state: 'Maharashtra', pincode: '400054', dateFound: '2026-09-22',
    reporterName: 'Sample Reporter', reporterMobile: '+91 90000 00203', reporterEmail: '', status: 'Rescue In Progress', assignedOrganizationId: 'pune-animal-rescue', assignedOrganizationName: 'Pune Animal Rescue', reportedAt: '22 Sep 2026', createdAt: '2026-09-22T09:00:00.000Z', updatedAt: '2026-09-22T09:00:00.000Z',
  },
  {
    id: 'RR-2026-004', animalType: 'Cat', breed: 'Domestic shorthair', age: 'Young', gender: 'Female', condition: 'Abandoned',
    description: 'A young cat was left near the market in Thane and has been brought to safety.', photo: rescuePhoto('photo-1514888286974-6c03e2ca1dba'),
    address: '5 Market Lane', city: 'Thane', state: 'Maharashtra', pincode: '400602', dateFound: '2026-09-21',
    reporterName: 'Sample Reporter', reporterMobile: '+91 90000 00204', reporterEmail: 'helper2@example.com', status: 'Animal Rescued', assignedOrganizationId: 'pune-animal-rescue', assignedOrganizationName: 'Pune Animal Rescue', reportedAt: '21 Sep 2026', createdAt: '2026-09-21T09:00:00.000Z', updatedAt: '2026-09-21T09:00:00.000Z',
  },
  {
    id: 'RR-2026-005', animalType: 'Dog', breed: 'Indie', age: 'Adult', gender: 'Unknown', condition: 'Lost',
    description: 'A dog reported lost in Mumbai has been safely brought into care.', photo: rescuePhoto('photo-1552053831-71594a27632d'),
    address: '18 Market Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', dateFound: '2026-09-20',
    reporterName: 'Sample Reporter', reporterMobile: '+91 90000 00205', reporterEmail: 'bruno@example.com', status: 'Pet Profile Created', assignedOrganizationId: 'pune-animal-rescue', assignedOrganizationName: 'Pune Animal Rescue', petId: 'bruno-report-five', petName: 'Bruno', reportedAt: '20 Sep 2026', createdAt: '2026-09-20T09:00:00.000Z', updatedAt: '2026-09-20T09:00:00.000Z',
  },
]

export const demoAdoptionRequests = [
  {
    id: 'AD-2026-001', petId: 'bruno', adopterId: 'adopter-rahul.sharma@example.com', organizationId: 'happy-paws-foundation',
    applicantName: 'Rahul Sharma', email: 'rahul.sharma@example.com', mobile: '+91 98765 43210', address: '14 Palm Avenue', city: 'Mumbai', pincode: '400050',
    reason: 'I would love a friendly companion and have time for daily walks and training.', housingType: 'Apartment', petExperience: 'Yes', hasOtherPets: false, otherPetsDetails: '', primaryCaregiver: 'Myself', additionalInformation: 'I work from home most weekdays.', status: 'Under Review', rejectionReason: '', submittedAt: '2026-09-24T10:15:00.000Z', updatedAt: '2026-09-24T10:15:00.000Z', completedAt: '',
  },
  {
    id: 'AD-2026-002', petId: 'luna', adopterId: 'adopter-sara.khan@example.com', organizationId: 'paw-care-shelter',
    applicantName: 'Sara Khan', email: 'sara.khan@example.com', mobile: '+91 98765 43211', address: '7 Garden Road', city: 'Thane', pincode: '400602',
    reason: 'Luna would suit our quiet home, and we are ready to provide patient care.', housingType: 'Apartment', petExperience: 'Yes', hasOtherPets: true, otherPetsDetails: 'One calm senior cat.', primaryCaregiver: 'Shared Family Responsibility', additionalInformation: 'We can introduce the cats gradually.', status: 'Approved', rejectionReason: '', submittedAt: '2026-09-22T10:15:00.000Z', updatedAt: '2026-09-23T10:15:00.000Z', completedAt: '',
  },
  {
    id: 'AD-2026-003', petId: 'max', adopterId: 'adopter-arjun.mehta@example.com', organizationId: 'happy-paws-foundation',
    applicantName: 'Arjun Mehta', email: 'arjun.mehta@example.com', mobile: '+91 98765 43212', address: '19 Lake Street', city: 'Mumbai', pincode: '400052',
    reason: 'I am interested in adopting Max and can offer a caring home.', housingType: 'Independent House', petExperience: 'No', hasOtherPets: false, otherPetsDetails: '', primaryCaregiver: 'Family Member', additionalInformation: '', status: 'Rejected', rejectionReason: 'The home routine described may not meet Max’s current activity needs.', submittedAt: '2026-09-19T10:15:00.000Z', updatedAt: '2026-09-20T10:15:00.000Z', completedAt: '',
  },
  {
    id: 'AD-2026-004', petId: 'coco', adopterId: 'adopter-neha.patel@example.com', organizationId: 'paw-care-shelter',
    applicantName: 'Neha Patel', email: 'neha.patel@example.com', mobile: '+91 98765 43213', address: '22 Hill View', city: 'Thane', pincode: '400603',
    reason: 'Our family is ready to welcome a playful puppy and support her training.', housingType: 'Independent House', petExperience: 'Yes', hasOtherPets: false, otherPetsDetails: '', primaryCaregiver: 'Shared Family Responsibility', additionalInformation: 'We have a secure outdoor area.', status: 'Completed', rejectionReason: '', submittedAt: '2026-09-16T10:15:00.000Z', updatedAt: '2026-09-24T10:15:00.000Z', completedAt: '2026-09-24T10:15:00.000Z',
  },
]
