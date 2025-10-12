import { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'

const AddRoom = () => {
  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free Wifi': false,
      'Free BreakFast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Images:', images)
    console.log('Inputs:', inputs)
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 max-w-3xl">
      {/* Title */}
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the room details carefully."
      />

      {/* Image Upload */}
      <p className="text-gray-800 mt-6 font-medium text-sm">Images</p>
      <div className="grid grid-cols-2 sm:flex gap-3 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key} className="cursor-pointer">
            <img
              className="h-24 w-24 object-cover opacity-80 hover:opacity-100 border border-gray-300 rounded"
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt="Upload"
            />
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              hidden
              onChange={(e) => {
                if (e.target.files[0]) {
                  setImages({ ...images, [key]: e.target.files[0] })
                }
              }}
            />
          </label>
        ))}
      </div>

      {/* Room Type & Price */}
      <div className="w-full flex max-sm:flex-col sm:gap-3 mt-3">
        <div className="flex-1 max-w-xs">
          <p className="text-gray-800 mt-3 font-medium text-sm">Room Type</p>
          <select
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-gray-300 mt-1 rounded p-1.5 w-full text-sm"
          >
            <option value="">Select</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-3 text-gray-800 font-medium text-sm">
            Price <span className="text-xs font-normal">/night</span>
          </p>
          <input
            type="number"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-1.5 w-24 text-sm"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
          />
        </div>
      </div>

      {/* Amenities */}
      <p className="text-gray-800 mt-4 font-medium text-sm">Amenities</p>
      <div className="flex flex-col mt-1 text-gray-600 max-w-sm gap-1.5 text-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity]
                  }
                })
              }
              className="cursor-pointer h-3 w-3"
            />
            <label
              htmlFor={`amenities${index + 1}`}
              className="cursor-pointer leading-tight">
              {amenity}</label>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-6 cursor-pointer text-sm font-medium"
      >
        Add Room
      </button>
    </form>
  )
}

export default AddRoom
